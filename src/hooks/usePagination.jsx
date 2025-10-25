import { useState, useEffect, useCallback, useMemo } from "react";
import { adminAPI } from "../utils/api";

export const usePagination = () => {
  const [allStudents, setAllStudents] = useState([]); // all students loaded once
  const [students, setStudents] = useState([]); // filtered and paginated students
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentAdminRole, setCurrentAdminRole] = useState("");

  // Fetch all students once on mount
  const fetchAllStudents = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminAPI.getStudentsPaginated({
        pageNumber: 1,
        pageSize: 10000, // large number to get all
        searchTerm: "",
        statusFilter: "all",
        sortBy: "name",
        sortOrder: "asc",
      });
      const { data } = response.data;
      setAllStudents(data || []);
      setError("");
      if (data && data.length > 0) {
        const firstStudent = data[0];
        if (
          Object.prototype.hasOwnProperty.call(firstStudent, "interviewScore") ||
          Object.prototype.hasOwnProperty.call(firstStudent, "InterviewScore")
        ) {
          setCurrentAdminRole("Admin");
        } else {
          setCurrentAdminRole("SuperAdmin");
        }
      }
    } catch (err) {
      setAllStudents([]);
      setError(err.response?.data || "Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Handle search (immediate UI update, instant filter)
  const handleSearch = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle status filter
  const handleStatusFilter = useCallback((newStatusFilter) => {
    setStatusFilter(newStatusFilter);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Handle sorting
  const handleSort = useCallback(
    (newSortBy) => {
      if (newSortBy === sortBy) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(newSortBy);
        setSortOrder("asc");
      }
      setCurrentPage(1);
    },
    [sortBy, sortOrder]
  );

  // Refresh data (re-fetch all students)
  const refreshData = useCallback(() => {
    fetchAllStudents();
  }, [fetchAllStudents]);

  // Fetch all students on mount
  useEffect(() => {
    fetchAllStudents();
  }, [fetchAllStudents]);

  // Memoized filtered and paginated students
  const filteredStudents = useMemo(() => {
    let filtered = allStudents;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.fullName && s.fullName.toLowerCase().includes(lower)) ||
          (s.nationalId && s.nationalId.toLowerCase().includes(lower)) ||
          (s.email && s.email.toLowerCase().includes(lower))
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => {
        // Handle different status formats
        const studentStatus = s.Status || s.status;
        
        // Convert status numbers to text for comparison
        const getStatusText = (status) => {
          switch (status) {
            case 1:
            case "1":
              return "Pending";
            case 2:
            case "2":
              return "Accepted";
            case 3:
            case "3":
              return "Rejected";
            case 4:
            case "4":
              return "Waitlisted";
            default:
              return "Pending";
          }
        };
        
        const statusText = getStatusText(studentStatus);
        return statusText === statusFilter;
      });
    }
    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case "name":
          aVal = a.fullName || "";
          bVal = b.fullName || "";
          break;
        case "finalYearScore":
          aVal = parseFloat(a.finalYearScore) || 0;
          bVal = parseFloat(b.finalYearScore) || 0;
          break;
        case "totalScore":
          // Sort by exam total (for Super Admin dashboard)
          const aExamTotal = (a.examMathScore || 0) + (a.examEnglishScore || 0) + (a.examArabicScore || 0) + (a.examSoftwareScore || 0);
          const bExamTotal = (b.examMathScore || 0) + (b.examEnglishScore || 0) + (b.examArabicScore || 0) + (b.examSoftwareScore || 0);
          aVal = Number(aExamTotal);
          bVal = Number(bExamTotal);
          break;
        case "percentage":
          // Calculate the same way as the Percentage column displays
          const aExamTotalForPercentage = (a.examMathScore || 0) + (a.examEnglishScore || 0) + (a.examArabicScore || 0) + (a.examSoftwareScore || 0);
          const bExamTotalForPercentage = (b.examMathScore || 0) + (b.examEnglishScore || 0) + (b.examArabicScore || 0) + (b.examSoftwareScore || 0);
          const aInterviewTotal = a.interviewScore || 0;
          const bInterviewTotal = b.interviewScore || 0;
          
          // For regular admin: examTotal + interviewTotal
          // For super admin: use totalPercentage or calculate examTotal + interviewTotal
          if (a.totalPercentage !== undefined && b.totalPercentage !== undefined) {
            // Super admin - use totalPercentage from backend
            aVal = Number(a.totalPercentage || 0);
            bVal = Number(b.totalPercentage || 0);
          } else {
            // Regular admin - use examTotal + interviewTotal
            aVal = Number(aExamTotalForPercentage + aInterviewTotal);
            bVal = Number(bExamTotalForPercentage + bInterviewTotal);
          }
          break;
        case "interviewScore":
          aVal = parseFloat(a.interviewScore) || 0;
          bVal = parseFloat(b.interviewScore) || 0;
          break;
        default:
          aVal = a[sortBy] || "";
          bVal = b[sortBy] || "";
      }
      
      // Handle string values (like names)
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      
      // Handle number values (like percentages, scores)
      if (typeof aVal === "number" && typeof bVal === "number") {
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }
      
      // Handle string comparison
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    // Pagination
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [allStudents, searchTerm, statusFilter, sortBy, sortOrder, currentPage, pageSize]);

  // Update students and total counts when filteredStudents changes
  useEffect(() => {
    setStudents(filteredStudents);
    // Update totalItems and totalPages for pagination
    let filtered = allStudents;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.fullName && s.fullName.toLowerCase().includes(lower)) ||
          (s.nationalId && s.nationalId.toLowerCase().includes(lower)) ||
          (s.email && s.email.toLowerCase().includes(lower))
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => {
        // Handle different status formats
        const studentStatus = s.Status || s.status;
        
        // Convert status numbers to text for comparison
        const getStatusText = (status) => {
          switch (status) {
            case 1:
            case "1":
              return "Pending";
            case 2:
            case "2":
              return "Accepted";
            case 3:
            case "3":
              return "Rejected";
            case 4:
            case "4":
              return "Waitlisted";
            default:
              return "Pending";
          }
        };
        
        const statusText = getStatusText(studentStatus);
        return statusText === statusFilter;
      });
    }
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));
  }, [filteredStudents, allStudents, searchTerm, statusFilter, pageSize]);

  return {
    students,
    allStudents,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    isLoading,
    error,
    searchTerm,
    statusFilter,
    sortBy,
    sortOrder,
    currentAdminRole,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleStatusFilter,
    handleSort,
    refreshData,
    setError,
  };
};
