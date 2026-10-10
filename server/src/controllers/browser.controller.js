import { Op, fn, col } from 'sequelize';
import SearchActivity from '../db/models/SearchActivity.js';
import User from '../db/models/User.js';

/**
 * Helper to safely extract domain name from a URL or text input.
 */
export const extractDomain = (input, engine = 'Google') => {
  if (!input || typeof input !== 'string') {
    return engineDomainFallback(engine);
  }

  const trimmed = input.trim();

  // Try parsing as standard URL
  try {
    let toParse = trimmed;
    if (!toParse.startsWith('http://') && !toParse.startsWith('https://')) {
      // Check if it looks like a domain (e.g. google.com, sub.domain.org/path)
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(toParse)) {
        toParse = `https://${toParse}`;
      }
    }

    if (toParse.startsWith('http://') || toParse.startsWith('https://')) {
      const parsed = new URL(toParse);
      let hostname = parsed.hostname.toLowerCase();
      if (hostname.startsWith('www.')) {
        hostname = hostname.slice(4);
      }
      if (hostname) return hostname;
    }
  } catch {
    // URL parsing failed, fall through to regex/engine fallback
  }

  // Regex check for domain-like string inside text
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/i);
  if (match && match[1]) {
    return match[1].toLowerCase();
  }

  // Fallback to the search engine's domain
  return engineDomainFallback(engine);
};

const engineDomainFallback = (engine) => {
  const map = {
    google: 'google.com',
    bing: 'bing.com',
    duckduckgo: 'duckduckgo.com',
    yahoo: 'yahoo.com',
    wikipedia: 'wikipedia.org',
    youtube: 'youtube.com',
  };
  const key = (engine || '').toLowerCase().trim();
  return map[key] || 'google.com';
};

/**
 * POST /api/v1/browser/search-activity
 * Save user web search activity to the database with domain name and timestamp.
 */
export const recordSearchActivity = async (req, res) => {
  try {
    const { query, url, domain, engine = 'Google', timestamp } = req.body;

    if (!query && !url) {
      return res.status(400).json({
        success: false,
        message: 'Search query or URL is required',
      });
    }

    // Determine domain: use provided domain, or extract from url, or fallback from query/engine
    let resolvedDomain = domain ? domain.trim().toLowerCase() : '';
    if (resolvedDomain.startsWith('www.')) {
      resolvedDomain = resolvedDomain.slice(4);
    }
    if (!resolvedDomain) {
      resolvedDomain = extractDomain(url || query, engine);
    }

    const searchQuery = (query || url || '').trim();
    const targetUrl = url ? url.trim() : `https://${resolvedDomain}/search?q=${encodeURIComponent(searchQuery)}`;
    const activityTimestamp = timestamp ? new Date(timestamp) : new Date();

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      null;

    const userAgent = req.headers['user-agent'] || null;

    const newActivity = await SearchActivity.create({
      userId: req.user?.id || null,
      domain: resolvedDomain,
      query: searchQuery,
      url: targetUrl,
      engine: engine || 'Google',
      ipAddress,
      userAgent,
      timestamp: activityTimestamp,
    });

    // Optionally include user info if available
    const activityWithUser = await SearchActivity.findByPk(newActivity.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Web search activity tracked successfully',
      data: activityWithUser || newActivity,
    });
  } catch (error) {
    console.error('Error saving web search activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record web search activity',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/browser/search-activity
 * List web search activities with filters, pagination, and stats.
 */
export const getSearchActivities = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = (page - 1) * limit;

    const { search, domain, userId, engine } = req.query;

    const where = {};

    // Access control: non-admins can only see their own activities
    if (req.user?.role !== 'admin') {
      where.userId = req.user.id;
    } else if (userId && userId !== 'all') {
      where.userId = userId;
    }

    if (domain) {
      where.domain = { [Op.iLike]: `%${domain.trim()}%` };
    }

    if (engine && engine !== 'all') {
      where.engine = { [Op.iLike]: engine.trim() };
    }

    if (search) {
      const searchPattern = `%${search.trim()}%`;
      where[Op.or] = [
        { query: { [Op.iLike]: searchPattern } },
        { domain: { [Op.iLike]: searchPattern } },
        { url: { [Op.iLike]: searchPattern } },
      ];
    }

    const { rows: activities, count: total } = await SearchActivity.findAndCountAll({
      where,
      limit,
      offset,
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
    });

    // Calculate aggregate statistics for telemetry
    const statsWhere = req.user?.role !== 'admin' ? { userId: req.user.id } : {};

    const totalCount = await SearchActivity.count({ where: statsWhere });

    // Distinct domains count
    const uniqueDomainsResult = await SearchActivity.findAll({
      where: statsWhere,
      attributes: [[fn('COUNT', fn('DISTINCT', col('domain'))), 'count']],
      raw: true,
    });
    const uniqueDomains = parseInt(uniqueDomainsResult?.[0]?.count, 10) || 0;

    // Top domains
    const topDomains = await SearchActivity.findAll({
      where: statsWhere,
      attributes: [
        'domain',
        [fn('COUNT', col('domain')), 'count'],
        [fn('MAX', col('timestamp')), 'lastSearched'],
      ],
      group: ['domain'],
      order: [[fn('COUNT', col('domain')), 'DESC']],
      limit: 5,
      raw: true,
    });

    // Today count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCount = await SearchActivity.count({
      where: {
        ...statsWhere,
        timestamp: { [Op.gte]: startOfToday },
      },
    });

    return res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalSearches: totalCount,
        uniqueDomains,
        todaySearches: todayCount,
        topDomains,
      },
    });
  } catch (error) {
    console.error('Error fetching search activities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch web search activities',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/v1/browser/search-activity/:id
 * Delete a single search activity log.
 */
export const deleteSearchActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await SearchActivity.findByPk(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Search activity not found',
      });
    }

    // Only owner or admin can delete
    if (req.user?.role !== 'admin' && activity.userId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
      });
    }

    await activity.destroy();

    return res.status(200).json({
      success: true,
      message: 'Search activity entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting search activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete search activity',
    });
  }
};

/**
 * DELETE /api/v1/browser/search-activity
 * Clear search history for user (or all if admin).
 */
export const clearSearchActivities = async (req, res) => {
  try {
    const { clearAll } = req.query;
    const where = {};

    if (req.user?.role === 'admin' && clearAll === 'true') {
      // Admin cleared all
    } else {
      where.userId = req.user.id;
    }

    const deletedCount = await SearchActivity.destroy({ where });

    return res.status(200).json({
      success: true,
      message: `Cleared ${deletedCount} search activity records`,
      count: deletedCount,
    });
  } catch (error) {
    console.error('Error clearing search activities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear search activities',
    });
  }
};

/**
 * GET /api/v1/browser/proxy
 * Live proxy endpoint that removes X-Frame-Options and CSP headers to allow
 * in-app URL previews directly inside an iframe.
 */
export const proxyWebPreview = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send('URL query parameter is required');
    }

    let targetUrl = decodeURIComponent(url).trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // If query is an automated Google search that often gets bot-blocked, fallback to clean DuckDuckGo Lite search
    const isGoogleSearch = targetUrl.includes('google.com/search');
    let fetchUrl = targetUrl;
    if (isGoogleSearch) {
      try {
        const parsed = new URL(targetUrl);
        const q = parsed.searchParams.get('q');
        if (q) {
          fetchUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(q)}`;
        }
      } catch {
        // use targetUrl
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || 'text/html';

    // If binary/image/pdf or not HTML, return the raw stream
    if (!contentType.includes('text/html')) {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      return res.send(Buffer.from(buffer));
    }

    let html = await response.text();

    // Check if Google returned a captcha/unusual traffic block
    if (html.includes('detected unusual traffic') || html.includes('solveSimpleChallenge')) {
      try {
        const parsed = new URL(targetUrl);
        const q = parsed.searchParams.get('q') || '';
        const fallbackRes = await fetch(`https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(q)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
          },
        });
        html = await fallbackRes.text();
        targetUrl = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
      } catch {
        // continue
      }
    }

    // Strip CSP meta tags and X-Frame-Options meta tags
    html = html.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');

    // Neutralize frame-busting scripts (top.location, window.top !== window.self)
    html = html.replace(/window\.top\s*!==\s*window\.self/gi, 'false');
    html = html.replace(/window\.top\s*!=\s*window\.self/gi, 'false');
    html = html.replace(/top\.location/gi, 'window._proxyLocation');
    html = html.replace(/window\.top/gi, 'window.self');
    html = html.replace(/parent\.location/gi, 'window._proxyLocation');

    // Inject frame helper script & base tag
    try {
      const parsedTarget = new URL(targetUrl);
      const baseHref = parsedTarget.origin + parsedTarget.pathname.substring(0, parsedTarget.pathname.lastIndexOf('/') + 1) || parsedTarget.origin + '/';

      const scriptInjection = `
        <base href="${baseHref}">
        <script>
          try {
            window.top = window.self;
            window.parent = window.self;
          } catch(e) {}
        </script>
      `;

      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${scriptInjection}`);
      } else if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, `$&${scriptInjection}`);
      } else {
        html = `${scriptInjection}${html}`;
      }
    } catch {
      // ignore
    }

    // Remove restrictive frame headers
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    return res.send(html);
  } catch (error) {
    console.error('Proxy web preview error:', error.message);
    const fallbackTarget = req.query.url || '#';
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #0b0f19;
              color: #f1f5f9;
            }
            .preview-card {
              max-width: 520px;
              text-align: center;
              padding: 40px 32px;
              background: #111827;
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            }
            .badge {
              display: inline-block;
              padding: 6px 14px;
              border-radius: 9999px;
              background: rgba(99, 102, 241, 0.15);
              color: #818cf8;
              font-weight: 700;
              font-size: 12px;
              margin-bottom: 16px;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
            h2 {
              margin: 0 0 12px 0;
              font-size: 22px;
              font-weight: 800;
            }
            p {
              color: #94a3b8;
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 24px;
            }
            .btn {
              display: inline-block;
              padding: 12px 24px;
              border-radius: 12px;
              background: linear-gradient(62.72deg, #903AD9 6.2%, #4170E5 46.41%, #11BCC6 76.75%);
              color: #ffffff;
              text-decoration: none;
              font-weight: 700;
              font-size: 14px;
              transition: opacity 0.2s;
            }
            .btn:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="preview-card">
            <span class="badge">Protected Domain</span>
            <h2>In-App Preview Guard</h2>
            <p>The destination (<strong>${fallbackTarget}</strong>) restricts embedded frame rendering or requires direct browser authentication. You can launch it directly in a dedicated tab.</p>
            <a class="btn" href="${fallbackTarget}" target="_blank" rel="noopener noreferrer">Open Destination Directly &rarr;</a>
          </div>
        </body>
      </html>
    `);
  }
};


/**
 * GET /api/v1/browser/preview-meta
 * Scrapes metadata (title, description, favicon, og:image) for instant rich URL preview cards.
 */
export const getUrlPreviewMeta = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL required' });
    }

    let targetUrl = decodeURIComponent(url).trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeout);
    const html = await response.text();
    const parsed = new URL(targetUrl);

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsed.hostname;

    // Description
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : `Live web preview for ${parsed.hostname}`;

    // Image
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    let image = imageMatch ? imageMatch[1].trim() : null;
    if (image && !image.startsWith('http')) {
      image = new URL(image, parsed.origin).href;
    }

    const domain = parsed.hostname.replace(/^www\./, '');
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    return res.status(200).json({
      success: true,
      data: {
        url: targetUrl,
        domain,
        title,
        description,
        image,
        favicon,
        status: response.status,
      },
    });
  } catch (error) {
    const rawDomain = extractDomain(req.query.url || '');
    return res.status(200).json({
      success: true,
      data: {
        url: req.query.url,
        domain: rawDomain,
        title: req.query.url,
        description: 'Web page destination',
        favicon: `https://www.google.com/s2/favicons?domain=${rawDomain}&sz=64`,
        status: 200,
      },
    });
  }
};

