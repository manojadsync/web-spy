import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import PropTypes from "prop-types";

const DataTable = ({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  size = "medium",
  stickyHeader = false,
  maxHeight,
  ...tableProps
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const headerBg = isDark ? theme.palette.background.newPaper : "#111827";
  const zebraBg = isDark
    ? alpha(theme.palette.primary.main, 0.08)
    : "#F7F6FE";
  const hoverBg = isDark
    ? alpha(theme.palette.primary.main, 0.16)
    : "#f1f5f9";

  if (loading) {
    return (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: theme.palette.divider,
          overflow: "hidden",
          background: theme.palette.background.card,
        }}
      >
        <Table size={size}>
          <TableHead sx={{ bgcolor: headerBg }}>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index} sx={{ color: "#ffffff", py: 2 }}>
                  <Skeleton variant="text" width="70%" sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index} sx={{ bgcolor: index % 2 === 1 ? zebraBg : "transparent" }}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex} sx={{ py: 2, borderColor: theme.palette.divider }}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: "16px",
          border: "1px solid",
          borderColor: theme.palette.divider,
          background: theme.palette.background.card,
        }}
      >
        <Typography color="text.secondary" fontWeight={500}>
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: theme.palette.divider,
        overflow: "hidden",
        maxHeight,
        background: theme.palette.background.card,
        boxShadow: isDark
          ? "0 4px 20px rgba(0,0,0,0.25)"
          : "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <Table size={size} stickyHeader={stickyHeader} {...tableProps}>
        <TableHead>
          <TableRow sx={{ bgcolor: `${headerBg} !important` }}>
            {columns.map((column, index) => (
              <TableCell
                key={column.key || index}
                align={column.align || "left"}
                sx={{
                  color: "#ffffff !important",
                  bgcolor: `${headerBg} !important`,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  py: 2,
                  px: 2.5,
                  borderBottom: "none",
                  minWidth: column.minWidth,
                  width: column.width,
                  ...column.headerStyle,
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              sx={{
                bgcolor: rowIndex % 2 === 1 ? zebraBg : "transparent",
                transition: "background-color 0.15s ease",
                "&:hover": {
                  bgcolor: `${hoverBg} !important`,
                },
              }}
            >
              {columns.map((column, colIndex) => (
                <TableCell
                  key={column.key || colIndex}
                  align={column.align || "left"}
                  sx={{
                    py: 1.8,
                    px: 2.5,
                    fontSize: "0.86rem",
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                    ...column.cellStyle,
                  }}
                >
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node.isRequired,
      render: PropTypes.func,
      align: PropTypes.oneOf(["left", "center", "right"]),
      minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      headerStyle: PropTypes.object,
      cellStyle: PropTypes.object,
    }),
  ).isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium"]),
  stickyHeader: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tableKey: PropTypes.string,
};

export default DataTable;
