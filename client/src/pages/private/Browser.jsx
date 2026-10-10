import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";

// Icons
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import WebRoundedIcon from "@mui/icons-material/LanguageRounded";

// Internal Components & APIs
import CardWrapper from "../../components/common/CardWrapper";
import MetricCard from "../../components/common/MetricCard";
import GradientButton from "../../components/common/GradientButton";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import { browserApi } from "../../api/endpoints/browserApi";
import { useAuth } from "../../context/AuthContext";
import { GRADIANT_COLOR } from "../../constants";

// Supported search engines with domain mapping & query URL
const SEARCH_ENGINES = {
  Google: {
    domain: "google.com",
    searchUrl: "https://www.google.com/search?q=",
    color: "#4285F4",
  },
  DuckDuckGo: {
    domain: "duckduckgo.com",
    searchUrl: "https://duckduckgo.com/?q=",
    color: "#DE5833",
  },
  Bing: {
    domain: "bing.com",
    searchUrl: "https://www.bing.com/search?q=",
    color: "#008373",
  },
  Wikipedia: {
    domain: "wikipedia.org",
    searchUrl: "https://en.wikipedia.org/wiki/Special:Search?search=",
    color: "#636466",
  },
  Yahoo: {
    domain: "yahoo.com",
    searchUrl: "https://search.yahoo.com/search?p=",
    color: "#6001D2",
  },
};

// Popular quick bookmarks
const QUICK_BOOKMARKS = [
  { label: "Google", domain: "google.com", url: "https://google.com" },
  { label: "GitHub", domain: "github.com", url: "https://github.com" },
  { label: "Wikipedia", domain: "wikipedia.org", url: "https://wikipedia.org" },
  {
    label: "Stack Overflow",
    domain: "stackoverflow.com",
    url: "https://stackoverflow.com",
  },
  {
    label: "Hacker News",
    domain: "news.ycombinator.com",
    url: "https://news.ycombinator.com",
  },
  { label: "Reddit", domain: "reddit.com", url: "https://reddit.com" },
];

// Helper to format date and time
const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// Helper for relative time (e.g. "Just now", "2m ago")
const getRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diffSec < 10) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
};

// Helper to extract domain from string
const extractDomainString = (input, engine = "Google") => {
  if (!input) return SEARCH_ENGINES[engine]?.domain || "google.com";
  try {
    let raw = input.trim();
    if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(raw)) {
        raw = `https://${raw}`;
      }
    }
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const parsed = new URL(raw);
      let host = parsed.hostname.toLowerCase();
      if (host.startsWith("www.")) host = host.slice(4);
      if (host) return host;
    }
  } catch {
    // fall through
  }
  return SEARCH_ENGINES[engine]?.domain || "google.com";
};

const Browser = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";
  const iframeRef = useRef(null);

  // Active Tab: 0 = Browser, 1 = Search Activity History, 2 = Domain Analytics
  const [activeTab, setActiveTab] = useState(0);

  // In-Browser View Mode: "results" (search results list), "live" (embedded iframe preview), "card" (rich URL metadata preview)
  const [previewMode, setPreviewMode] = useState("results");
  const [iframeLoading, setIframeLoading] = useState(false);
  const [previewMeta, setPreviewMeta] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Auto-dismiss iframe spinner after 6 seconds to prevent hanging
  useEffect(() => {
    if (iframeLoading) {
      const timer = setTimeout(() => setIframeLoading(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [iframeLoading]);

  // Browser state
  const [urlInput, setUrlInput] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("Google");
  const [currentDomain, setCurrentDomain] = useState("google.com");
  const [currentUrl, setCurrentUrl] = useState("https://google.com");
  const [currentQuery, setCurrentQuery] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);
  const historyStackRef = useRef([]);

  const pushHistory = (entry) => {
    const nextIndex = historyIndexRef.current + 1;
    const nextStack = [...historyStackRef.current.slice(0, nextIndex), entry];
    historyStackRef.current = nextStack;
    historyIndexRef.current = nextIndex;
    setHistoryStack(nextStack);
    setHistoryIndex(nextIndex);
  };

  // Search results simulation data
  const [searchResults, setSearchResults] = useState(null);

  // Database activity logs state
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalSearches: 0,
    uniqueDomains: 0,
    todaySearches: 0,
    topDomains: [],
  });
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");

  // Notification state
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");
  const [showToast, setShowToast] = useState(false);
  const [lastLoggedEntry, setLastLoggedEntry] = useState(null);

  // Delete confirm dialog
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch search activities from DB
  const fetchActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const params = {};
      if (searchFilter.trim()) params.search = searchFilter.trim();
      if (domainFilter.trim()) params.domain = domainFilter.trim();

      const response = await browserApi.getSearchActivities(params);
      if (response.success) {
        setActivities(response.data || []);
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load search activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  }, [searchFilter, domainFilter]);

  // Load activities on mount
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Fetch rich URL metadata for preview
  const fetchUrlMeta = async (url) => {
    try {
      setLoadingMeta(true);
      const res = await browserApi.getUrlPreviewMeta(url);
      if (res.success && res.data) {
        setPreviewMeta(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch preview metadata:", err);
    } finally {
      setLoadingMeta(false);
    }
  };

  // Perform a web search & track to database: ALWAYS shows the results list first
  const handlePerformSearch = async (
    queryToSearch,
    engineToUse = selectedEngine,
    forceMode = null,
  ) => {
    const rawQuery = (
      queryToSearch !== undefined ? queryToSearch : urlInput
    ).trim();
    if (!rawQuery) return;

    setIsNavigating(true);

    const isDirectUrl =
      /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$)/i.test(rawQuery);
    let resolvedUrl = "";
    let resolvedDomain = "";

    if (isDirectUrl) {
      resolvedUrl =
        rawQuery.startsWith("http://") || rawQuery.startsWith("https://")
          ? rawQuery
          : `https://${rawQuery}`;
      resolvedDomain = extractDomainString(resolvedUrl, engineToUse);
    } else {
      const engineConfig = SEARCH_ENGINES[engineToUse] || SEARCH_ENGINES.Google;
      resolvedUrl = `${engineConfig.searchUrl}${encodeURIComponent(rawQuery)}`;
      resolvedDomain = engineConfig.domain;
    }

    setCurrentDomain(resolvedDomain);
    setCurrentUrl(resolvedUrl);
    setCurrentQuery(rawQuery);
    setUrlInput(rawQuery);

    // Generate contextual simulated search results
    const resultsData = generateSimulatedResults(
      rawQuery,
      resolvedDomain,
      engineToUse,
      resolvedUrl,
    );

    const isLive = Boolean(forceMode === "live" || isDirectUrl);
    if (isLive) {
      setPreviewMode("live");
      setIframeLoading(true);
    } else {
      setPreviewMode("results");
    }

    // Update history stack with complete state entry
    const newEntry = {
      type: isLive ? "live" : "results",
      url: resolvedUrl,
      query: rawQuery,
      domain: resolvedDomain,
      title: rawQuery,
      searchResults: resultsData,
    };
    pushHistory(newEntry);

    // Fetch rich URL preview metadata
    fetchUrlMeta(resolvedUrl);

    // Save search activity in PostgreSQL DB with domain and timestamp
    try {
      const payload = {
        query: rawQuery,
        url: resolvedUrl,
        domain: resolvedDomain,
        engine: isDirectUrl ? "Direct URL" : engineToUse,
        timestamp: new Date().toISOString(),
      };

      const response = await browserApi.recordSearchActivity(payload);
      if (response.success) {
        const savedRecord = response.data;
        setLastLoggedEntry(savedRecord);
        setToastMessage(
          `✓ Activity logged: Domain "${resolvedDomain}" at ${formatDateTime(savedRecord.timestamp)}`,
        );
        setToastSeverity("success");
        setShowToast(true);

        fetchActivities();
      }
    } catch (err) {
      console.error("Failed to record web search activity:", err);
      setToastMessage("Warning: Failed to save search activity to database");
      setToastSeverity("error");
      setShowToast(true);
    } finally {
      setIsNavigating(false);
    }
  };

  // Open Live In-App Preview for a specific clicked result
  const handleOpenLivePreview = (targetUrl, itemTitle) => {
    const parsedDomain = extractDomainString(targetUrl);
    setCurrentUrl(targetUrl);
    setCurrentDomain(parsedDomain);
    setCurrentQuery(itemTitle || targetUrl);
    setUrlInput(targetUrl);
    setPreviewMode("live");
    setIframeLoading(true);
    fetchUrlMeta(targetUrl);

    // Track history for Back and Forward navigation
    const newEntry = {
      type: "live",
      url: targetUrl,
      query: itemTitle || targetUrl,
      domain: parsedDomain,
      title: itemTitle || parsedDomain,
    };
    pushHistory(newEntry);

    // Track click event in DB
    browserApi
      .recordSearchActivity({
        query: itemTitle || targetUrl,
        url: targetUrl,
        domain: parsedDomain,
        engine: "In-Browser Navigation",
        timestamp: new Date().toISOString(),
      })
      .then(() => fetchActivities());
  };

  // Generate simulated results with rich metadata for user searches
  const generateSimulatedResults = (query, domain, engine, targetUrl) => {
    const q = (query || "").trim().toLowerCase();

    // Contextual responses for major search destinations
    const platformData = {
      instagram: {
        domain: "instagram.com",
        items: [
          {
            title: "Instagram — Photos, Videos & Stories",
            url: "https://www.instagram.com",
            displayUrl: "https://www.instagram.com",
            snippet:
              "Create an account or log in to Instagram - Share what you're into with the people who get you. Connect with friends, share photos and videos.",
          },
          {
            title: "Instagram Help Center",
            url: "https://help.instagram.com",
            displayUrl: "https://help.instagram.com",
            snippet:
              "Get help with login, account recovery, security, privacy settings, and feature guides on Instagram.",
          },
          {
            title: "Instagram — Wikipedia Overview",
            url: "https://en.wikipedia.org/wiki/Instagram",
            displayUrl: "https://en.wikipedia.org/wiki/Instagram",
            snippet:
              "Instagram is an American photo and video sharing social networking service founded in 2010 by Kevin Systrom and Mike Krieger.",
          },
          {
            title: "Instagram for Business & Creators",
            url: "https://business.instagram.com",
            displayUrl: "https://business.instagram.com",
            snippet:
              "Reach new customers, increase brand awareness, and sell products directly on Instagram.",
          },
        ],
      },
      youtube: {
        domain: "youtube.com",
        items: [
          {
            title: "YouTube: Watch, Listen, Stream",
            url: "https://www.youtube.com",
            displayUrl: "https://www.youtube.com",
            snippet:
              "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.",
          },
          {
            title: "YouTube Music",
            url: "https://music.youtube.com",
            displayUrl: "https://music.youtube.com",
            snippet:
              "A new music service with official albums, singles, videos, remixes, live performances and more for Android, iOS and desktop.",
          },
          {
            title: "YouTube — Wikipedia",
            url: "https://en.wikipedia.org/wiki/YouTube",
            displayUrl: "https://en.wikipedia.org/wiki/YouTube",
            snippet:
              "YouTube is an American online video sharing and social media platform headquartered in San Bruno, California.",
          },
          {
            title: "YouTube Studio & Creator Hub",
            url: "https://studio.youtube.com",
            displayUrl: "https://studio.youtube.com",
            snippet:
              "Manage your YouTube channel, track analytics, interact with fans, and monetize your content.",
          },
        ],
      },
      facebook: {
        domain: "facebook.com",
        items: [
          {
            title: "Facebook — Log In or Sign Up",
            url: "https://www.facebook.com",
            displayUrl: "https://www.facebook.com",
            snippet:
              "Connect with friends, family and other people you know. Share photos and videos, send messages and get updates.",
          },
          {
            title: "Facebook Help Center",
            url: "https://www.facebook.com/help",
            displayUrl: "https://www.facebook.com/help",
            snippet:
              "Learn how to use Facebook, fix a problem, and get answers to your questions.",
          },
          {
            title: "Facebook — Wikipedia",
            url: "https://en.wikipedia.org/wiki/Facebook",
            displayUrl: "https://en.wikipedia.org/wiki/Facebook",
            snippet:
              "Facebook is an online social media and social networking service owned by Meta Platforms.",
          },
        ],
      },
      github: {
        domain: "github.com",
        items: [
          {
            title: "GitHub: Let's build from here",
            url: "https://github.com",
            displayUrl: "https://github.com",
            snippet:
              "GitHub is where over 100 million developers shape the future of software, together. Explore millions of open source repositories.",
          },
          {
            title: "GitHub Docs — Official Documentation",
            url: "https://docs.github.com",
            displayUrl: "https://docs.github.com",
            snippet:
              "Get started with GitHub, learn Git commands, configure workflows with GitHub Actions, and collaborate with teams.",
          },
        ],
      },
    };

    let matchedItems = null;
    let matchedDomain = domain;

    for (const [key, val] of Object.entries(platformData)) {
      if (q.includes(key)) {
        matchedItems = val.items;
        matchedDomain = val.domain;
        break;
      }
    }

    const items = matchedItems || [
      {
        title: `${query} — Official Portal & Overview`,
        url: targetUrl.startsWith("http")
          ? targetUrl
          : `https://${domain}/${encodeURIComponent(query.replace(/\s+/g, "-"))}`,
        displayUrl: `https://${domain}/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, "-"))}`,
        snippet: `Comprehensive web intelligence, official documentation, and live insights for "${query}". Detailed breakdown including telemetry, system updates, and real-time resources.`,
      },
      {
        title: `Everything You Need to Know About ${query}`,
        url: `https://${domain}/guide/${encodeURIComponent(query)}`,
        displayUrl: `https://${domain}/guide/${encodeURIComponent(query)}`,
        snippet: `Explore trending discussions, best practices, and verified information regarding "${query}". Updated regularly with community insights and deep analytics.`,
      },
      {
        title: `${query} — Tech Community Discussions & Q&A`,
        url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(query)}`,
        displayUrl: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(query)}`,
        snippet: `Active questions, answers, and code examples for "${query}". Join software engineers and researchers collaborating on real-world challenges.`,
      },
      {
        title: `GitHub Repositories and Libraries: ${query}`,
        url: `https://github.com/search?q=${encodeURIComponent(query)}`,
        displayUrl: `https://github.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Open-source repositories, developer tools, and client packages matching "${query}". Check commits, stars, and release notes.`,
      },
    ];

    const resultsData = {
      query,
      domain: matchedDomain,
      engine,
      totalCount: (Math.floor(Math.random() * 850) + 120) * 1000,
      searchTime: (Math.random() * 0.4 + 0.12).toFixed(2),
      items,
    };

    setSearchResults(resultsData);
    return resultsData;
  };

  // Handle Enter key in URL input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handlePerformSearch();
    }
  };

  // Apply history entry state
  const applyHistoryEntry = (entry) => {
    if (!entry) return;
    setCurrentUrl(entry.url || "");
    setCurrentDomain(entry.domain || "");
    setCurrentQuery(entry.query || "");
    setUrlInput(
      entry.type === "live" ? entry.url || "" : entry.query || entry.url || "",
    );
    setPreviewMode(entry.type || "results");

    if (entry.type === "live") {
      setIframeLoading(true);
      fetchUrlMeta(entry.url);
    } else {
      if (entry.searchResults) {
        setSearchResults(entry.searchResults);
      } else if (entry.query) {
        generateSimulatedResults(
          entry.query,
          entry.domain,
          selectedEngine,
          entry.url,
        );
      }
      fetchUrlMeta(entry.url);
    }
  };

  // History back & forward
  const canGoBack =
    historyIndex > 0 || (previewMode === "live" && Boolean(searchResults));
  const canGoForward =
    historyIndex < historyStack.length - 1 ||
    (previewMode === "results" && Boolean(currentUrl) && currentUrl !== "https://google.com");

  const handleGoBack = () => {
    if (historyIndexRef.current > 0) {
      const newIndex = historyIndexRef.current - 1;
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      const targetEntry = historyStackRef.current[newIndex];
      applyHistoryEntry(targetEntry);
    } else if (previewMode === "live" && searchResults) {
      setPreviewMode("results");
      setUrlInput(searchResults.query || currentQuery || "");
    }
  };

  const handleGoForward = () => {
    if (historyIndexRef.current < historyStackRef.current.length - 1) {
      const newIndex = historyIndexRef.current + 1;
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      const targetEntry = historyStackRef.current[newIndex];
      applyHistoryEntry(targetEntry);
    } else if (previewMode === "results" && currentUrl && currentUrl !== "https://google.com") {
      setPreviewMode("live");
      setIframeLoading(true);
    }
  };

  // Delete a single search activity
  const handleDeleteActivity = async (id) => {
    try {
      setDeleting(true);
      const res = await browserApi.deleteSearchActivity(id);
      if (res.success) {
        setToastMessage("Search activity entry deleted");
        setToastSeverity("success");
        setShowToast(true);
        setActivities((prev) => prev.filter((a) => a.id !== id));
        fetchActivities();
      }
    } catch (err) {
      console.error("Failed to delete activity:", err);
      setToastMessage("Error deleting activity record");
      setToastSeverity("error");
      setShowToast(true);
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  // Clear all search activities
  const handleClearHistory = async () => {
    try {
      setDeleting(true);
      const res = await browserApi.clearSearchActivities(isAdmin);
      if (res.success) {
        setToastMessage(res.message || "Search history cleared");
        setToastSeverity("success");
        setShowToast(true);
        setActivities([]);
        fetchActivities();
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
      setToastMessage("Failed to clear history");
      setToastSeverity("error");
      setShowToast(true);
    } finally {
      setDeleting(false);
      setClearHistoryDialogOpen(false);
    }
  };

  // Quick re-search in browser from history
  const handleRerunSearch = (activity) => {
    setActiveTab(0);
    setUrlInput(activity.query);
    if (activity.engine && SEARCH_ENGINES[activity.engine]) {
      setSelectedEngine(activity.engine);
    }
    handlePerformSearch(
      activity.query,
      activity.engine || selectedEngine,
      "live",
    );
  };

  return (
    <Box sx={{ pb: 4 }}>

      {/* Real-time Telemetry Metrics - Admin Only */}
      {isAdmin && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2.5,
            mb: 3,
          }}
        >
          <MetricCard
            title="Searches Tracked"
            value={stats.totalSearches || activities.length}
            icon={
              <LanguageRoundedIcon
                sx={{ fontSize: 24, color: theme.palette.primary.main }}
              />
            }
            subtitle="Saved in PostgreSQL"
          />
          <MetricCard
            title="Unique Domains"
            value={stats.uniqueDomains || 0}
            icon={
              <PublicRoundedIcon
                sx={{ fontSize: 24, color: theme.palette.background.success }}
              />
            }
            subtitle="Distinct web origins"
          />
          <MetricCard
            title="Today's Activity"
            value={stats.todaySearches || 0}
            icon={
              <HistoryRoundedIcon
                sx={{ fontSize: 24, color: theme.palette.textcolors.link }}
              />
            }
            subtitle="Searches logged today"
          />
          <MetricCard
            title="Top Visited Domain"
            value={stats.topDomains?.[0]?.domain || "google.com"}
            icon={
              <StorageRoundedIcon
                sx={{ fontSize: 24, color: theme.palette.background.warning }}
              />
            }
            subtitle={
              stats.topDomains?.[0]?.count
                ? `${stats.topDomains[0].count} searches recorded`
                : "Most active domain"
            }
          />
        </Box>
      )}

      {/* Last Logged Activity Live Banner */}
      {lastLoggedEntry && (
        <Box
          sx={{
            mb: 3,
            p: 1.8,
            px: 2.5,
            borderRadius: "16px",
            bgcolor: isDark
              ? alpha(theme.palette.background.success, 0.12)
              : "#f0fdf4",
            border: `1px solid ${alpha(theme.palette.background.success, 0.3)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CheckCircleRoundedIcon
              sx={{ color: theme.palette.background.success, fontSize: 22 }}
            />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: theme.palette.text.primary }}
              >
                Database Event: Search Activity Saved
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
                Domain:{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                >
                  {lastLoggedEntry.domain}
                </Box>{" "}
                • Query: "{lastLoggedEntry.query}" • Timestamp:{" "}
                {formatDateTime(lastLoggedEntry.timestamp)}
              </Typography>
            </Box>
          </Box>
          <Chip
            size="small"
            label="Postgres Synced"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: "0.72rem" }}
          />
        </Box>
      )}

      {/* Navigation Tabs & Right-Aligned Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: theme.palette.divider,
          mb: 3,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              minHeight: 48,
              mr: 2,
            },
          }}
        >
          <Tab label="Browser" />
          <Tab label={`Search Logs (${activities.length})`} />
          <Tab label="Analytics" />
        </Tabs>

        {/* Right-Aligned Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            pb: { xs: 1, sm: 0 },
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
            onClick={fetchActivities}
            sx={{
              borderRadius: "10px",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.12)",
              color: theme.palette.text.primary,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.82rem",
              py: 0.6,
              px: 1.5,
            }}
          >
            Sync Database
          </Button>

          {activeTab === 1 && activities.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={() => setClearHistoryDialogOpen(true)}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                py: 0.6,
                px: 1.5,
              }}
            >
              Clear Logs
            </Button>
          )}
        </Box>
      </Box>

      {/* ================= TAB 0: IN-APP BROWSER WITH URL PREVIEW ================= */}
      {activeTab === 0 && (
        <CardWrapper sx={{ p: 0, overflow: "hidden" }}>
          {/* Browser Chrome Header (macOS style window frame) */}
          <Box
            sx={{
              p: 2,
              bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            {/* Traffic lights (Three colored dots) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                pl: 0.5,
                pr: 0.5,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: "#ef4444",
                }}
              />
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: "#f59e0b",
                }}
              />
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: "#10b981",
                }}
              />
            </Box>

            {/* Back / Forward / Refresh */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <IconButton
                size="small"
                onClick={handleGoBack}
                disabled={!canGoBack}
                sx={{
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#e2e8f0",
                  "&:disabled": { opacity: 0.35 },
                }}
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleGoForward}
                disabled={!canGoForward}
                sx={{
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#e2e8f0",
                  "&:disabled": { opacity: 0.35 },
                }}
              >
                <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setIframeLoading(true);
                  if (iframeRef.current) {
                    iframeRef.current.src = browserApi.getProxyUrl(currentUrl);
                  }
                  handlePerformSearch(currentQuery || urlInput);
                }}
                sx={{
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#e2e8f0",
                }}
              >
                <RefreshRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* The Omnibox / Search & URL Input */}
            <TextField
              fullWidth
              size="small"
              placeholder="Enter search query or URL to preview (e.g. wikipedia.org, github.com)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip title="Secure In-App Connection">
                      <LockRoundedIcon
                        sx={{
                          fontSize: 16,
                          color: theme.palette.background.success,
                          ml: 0.5,
                        }}
                      />
                    </Tooltip>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {urlInput && (
                      <IconButton
                        size="small"
                        onClick={() => setUrlInput("")}
                        sx={{ mr: 0.5 }}
                      >
                        <ClearRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handlePerformSearch()}
                      disabled={isNavigating || !urlInput.trim()}
                      sx={{
                        color: theme.palette.primary.main,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      {isNavigating ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <SearchRoundedIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "14px",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                  fontSize: "0.9rem",
                  "& fieldset": { borderColor: theme.palette.divider },
                },
              }}
            />

            {/* Outer Button: RIB (no action for now) */}
            <GradientButton
              sx={{ minWidth: 80, py: 1, px: 2.5, flexShrink: 0 }}
            >
              RIB
            </GradientButton>
          </Box>

          {/* ================= BROWSER VIEWPORT CANVAS ================= */}
          <Box
            sx={{
              minHeight: 620,
              bgcolor: isDark ? "#0d1117" : "#ffffff",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* 1. Empty State (When no search has been performed yet) */}
            {!searchResults ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                  textAlign: "center",
                  px: 3,
                }}
              >
                <Box
                  sx={{
                    width: 76,
                    height: 76,
                    borderRadius: "22px",
                    background: GRADIANT_COLOR,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                    boxShadow: "0 8px 24px rgba(65, 112, 229, 0.35)",
                  }}
                >
                  <TravelExploreRoundedIcon
                    sx={{ fontSize: 40, color: "#ffffff" }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  In-App URL Preview & Web Browser
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    maxWidth: 540,
                    mb: 3,
                  }}
                >
                  Enter any website URL (e.g. <code>wikipedia.org</code>,{" "}
                  <code>github.com</code>) or search term above. The webpage is
                  rendered directly inside this window, while your search
                  queries, domain names, and timestamps are automatically
                  tracked and logged to PostgreSQL.
                </Typography>

                {/* Popular sample searches */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {[
                    "https://en.wikipedia.org/wiki/Artificial_intelligence",
                    "https://github.com",
                    "React 19 release features",
                    "PostgreSQL full text search",
                  ].map((query) => (
                    <Button
                      key={query}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setUrlInput(query);
                        handlePerformSearch(query, selectedEngine, "results");
                      }}
                      sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {query.startsWith("http")
                        ? query.split("/").slice(0, 3).join("/")
                        : `"${query}"`}
                    </Button>
                  ))}
                </Box>
              </Box>
            ) : previewMode === "live" ? (
              /* 2. MODE: LIVE IN-APP IFRAME PREVIEW */
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  position: "relative",
                }}
              >
                {/* Secondary In-Browser Subheader with Live Status */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 1,
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "#f1f5f9",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    {previewMeta?.favicon ? (
                      <Box
                        component="img"
                        src={previewMeta.favicon}
                        alt="favicon"
                        sx={{ width: 18, height: 18, borderRadius: "4px" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <PublicRoundedIcon
                        sx={{ fontSize: 18, color: theme.palette.primary.main }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {currentUrl}
                    </Typography>
                    <Chip
                      size="small"
                      label="In-App Frame Active"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {iframeLoading && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
                      >
                        <CircularProgress size={14} />
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Rendering webpage...
                        </Typography>
                      </Box>
                    )}
                    <Button
                      size="small"
                      variant="text"
                      endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
                      onClick={() =>
                        window.open(currentUrl, "_blank", "noopener,noreferrer")
                      }
                      sx={{
                        textTransform: "none",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        py: 0.2,
                      }}
                    >
                      Open Direct
                    </Button>
                  </Box>
                </Box>

                {/* The Embedded Preview Iframe */}
                <Box
                  sx={{
                    position: "relative",
                    flex: 1,
                    minHeight: 600,
                    bgcolor: "#ffffff",
                  }}
                >
                  {iframeLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 2,
                        bgcolor: isDark
                          ? "rgba(13, 17, 23, 0.85)"
                          : "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={36} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                        }}
                      >
                        Loading live preview of {currentDomain}...
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Stripping frame-ancestors & proxying assets in real time
                      </Typography>
                    </Box>
                  )}

                  <iframe
                    ref={iframeRef}
                    title="In-App Web Preview"
                    src={browserApi.getProxyUrl(currentUrl)}
                    onLoad={() => setIframeLoading(false)}
                    onError={() => setIframeLoading(false)}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    style={{
                      width: "100%",
                      height: "640px",
                      border: "none",
                      display: "block",
                      backgroundColor: "#ffffff",
                    }}
                  />
                </Box>

                {/* Embed Guard & Direct Fallback Footer */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.2,
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    💡 Website not loading or refused to connect? Big platforms
                    (like Google Login, YouTube) restrict embedding.
                  </Typography>
                </Box>
              </Box>
            ) : (
              /* MODE: SEARCH RESULTS EXPLORER */
              <Box
                sx={{
                  maxWidth: 880,
                  mx: "auto",
                  width: "100%",
                  p: { xs: 2.5, md: 4 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 2,
                    mb: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    About{" "}
                    {searchResults?.totalCount?.toLocaleString() || "10,000"}{" "}
                    results ({searchResults?.searchTime || "0.25"} seconds) for{" "}
                    <strong>"{searchResults?.query || ""}"</strong>
                  </Typography>

                  {searchResults?.domain && (
                    <Chip
                      size="small"
                      icon={<LockRoundedIcon sx={{ fontSize: 13 }} />}
                      label={`Tracked Domain: ${searchResults.domain}`}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                    />
                  )}
                </Box>

                {/* Result cards with instant in-browser preview click */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  {searchResults.items?.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2.5,
                        borderRadius: "14px",
                        bgcolor: isDark
                          ? "rgba(255, 255, 255, 0.03)"
                          : "#ffffff",
                        border: `1px solid ${theme.palette.divider}`,
                        transition:
                          "transform 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                          borderColor: theme.palette.primary.main,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          display: "block",
                          mb: 0.5,
                          fontSize: "0.78rem",
                        }}
                      >
                        {item.displayUrl}
                      </Typography>

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.textcolors.link || "#2563eb",
                          cursor: "pointer",
                          display: "inline-block",
                          mb: 1,
                          "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() =>
                          handleOpenLivePreview(item.url, item.title)
                        }
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {item.snippet}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </CardWrapper>
      )}

      {/* ================= TAB 1: SEARCH ACTIVITY DATABASE LOGS ================= */}
      {activeTab === 1 && (
        <CardWrapper>
          {/* Filter Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, flex: 1, flexWrap: "wrap" }}>
              {/* Search keyword filter */}
              <TextField
                size="small"
                placeholder="Filter by search query or URL..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{
                          fontSize: 18,
                          color: theme.palette.text.secondary,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 260, flex: { xs: 1, sm: "initial" } }}
              />

              {/* Domain filter */}
              <TextField
                size="small"
                placeholder="Filter domain (e.g. google.com)..."
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicRoundedIcon
                        sx={{
                          fontSize: 18,
                          color: theme.palette.text.secondary,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 220, flex: { xs: 1, sm: "initial" } }}
              />

              {(searchFilter || domainFilter) && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setSearchFilter("");
                    setDomainFilter("");
                  }}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
            >
              Showing {activities.length} entries
            </Typography>
          </Box>

          {/* Activities Data Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: "transparent",
              overflowX: "auto",
            }}
          >
            <Table size="medium">
              <TableHead
                sx={{
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.text.secondary,
                      py: 1.8,
                    }}
                  >
                    DOMAIN NAME
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.text.secondary,
                      py: 1.8,
                    }}
                  >
                    SEARCH QUERY / DESTINATION
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.text.secondary,
                      py: 1.8,
                    }}
                  >
                    TIMESTAMP
                  </TableCell>
                  {isAdmin && (
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: theme.palette.text.secondary,
                        py: 1.8,
                      }}
                    >
                      USER
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.text.secondary,
                      py: 1.8,
                    }}
                  >
                    ENGINE
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.text.secondary,
                      py: 1.8,
                    }}
                  >
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingActivities ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        No search activities recorded yet. Use the in-app
                        browser above to start searching!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow
                      key={activity.id}
                      sx={{
                        "&:hover": {
                          bgcolor: isDark
                            ? "rgba(255, 255, 255, 0.02)"
                            : "#f8fafc",
                        },
                      }}
                    >
                      {/* Domain Name */}
                      <TableCell sx={{ py: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "8px",
                              bgcolor: isDark
                                ? "rgba(255, 255, 255, 0.08)"
                                : "#e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.palette.primary.main,
                              flexShrink: 0,
                            }}
                          >
                            <PublicRoundedIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                              }}
                            >
                              {activity.domain}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {getRelativeTime(activity.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Search Query / URL */}
                      <TableCell sx={{ py: 2, maxWidth: 320 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {activity.query}
                        </Typography>
                        {activity.url && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {activity.url}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Explicit Timestamp */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {formatDateTime(activity.timestamp)}
                        </Typography>
                      </TableCell>

                      {/* User (Admin only) */}
                      {isAdmin && (
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {activity.user?.name || "System User"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {activity.user?.email || "—"}
                          </Typography>
                        </TableCell>
                      )}

                      {/* Engine */}
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          size="small"
                          label={activity.engine || "Google"}
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            borderRadius: "6px",
                            bgcolor: isDark
                              ? "rgba(255, 255, 255, 0.08)"
                              : "#f1f5f9",
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right" sx={{ py: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title="Preview again in Own Browser">
                            <IconButton
                              size="small"
                              onClick={() => handleRerunSearch(activity)}
                            >
                              <VisibilityRoundedIcon
                                sx={{
                                  fontSize: 18,
                                  color: theme.palette.primary.main,
                                }}
                              />
                            </IconButton>
                          </Tooltip>

                          {activity.url && (
                            <Tooltip title="Open external URL">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  window.open(
                                    activity.url,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                              >
                                <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Delete record">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteConfirmId(activity.id)}
                              sx={{
                                color:
                                  theme.palette.background.danger || "#ef4444",
                              }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardWrapper>
      )}

      {/* ================= TAB 2: DOMAIN ANALYTICS ================= */}
      {activeTab === 2 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <CardWrapper>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}
            >
              Top Visited Domains in Database
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mb: 3 }}
            >
              Aggregated frequency of domains extracted from all user web
              searches.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {stats.topDomains?.length > 0 ? (
                stats.topDomains.map((item, idx) => {
                  const maxCount = parseInt(
                    stats.topDomains[0]?.count || 1,
                    10,
                  );
                  const count = parseInt(item.count || 0, 10);
                  const percentage = Math.round((count / maxCount) * 100);

                  return (
                    <Box key={item.domain}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.8,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.text.primary,
                            }}
                          >
                            #{idx + 1} {item.domain}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${count} searches`}
                            sx={{
                              height: 20,
                              fontSize: "0.68rem",
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Last searched: {formatDateTime(item.lastSearched)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 10,
                          borderRadius: "5px",
                          bgcolor: isDark
                            ? "rgba(255, 255, 255, 0.08)"
                            : "#e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${percentage}%`,
                            background: GRADIANT_COLOR,
                            borderRadius: "5px",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  No domain metrics accumulated yet. Perform searches in the
                  in-app browser to generate metrics.
                </Typography>
              )}
            </Box>
          </CardWrapper>
        </Box>
      )}

      {/* Confirmation Dialog for single item delete */}
      <ConfirmationDialog
        open={Boolean(deleteConfirmId)}
        title="Delete Search Activity Record?"
        description="Are you sure you want to permanently delete this search log from the database? This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete Entry"}
        confirmColor="error"
        onConfirm={() => handleDeleteActivity(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Confirmation Dialog for clearing all history */}
      <ConfirmationDialog
        open={clearHistoryDialogOpen}
        title="Clear Search Activity History?"
        description="Are you sure you want to clear all tracked web search records from the database? This will reset all activity logs."
        confirmText={deleting ? "Clearing..." : "Clear All History"}
        confirmColor="error"
        onConfirm={handleClearHistory}
        onCancel={() => setClearHistoryDialogOpen(false)}
      />

      {/* Toast Notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity={toastSeverity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Browser;
