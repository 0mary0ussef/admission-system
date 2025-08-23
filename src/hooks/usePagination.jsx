import { useState, useEffect, useCallback, useRef } from "react";
import { adminAPI } from "../utils/api";

export const usePagination = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentAdminRole, setCurrentAdminRole] = useState("");
  const searchTimeoutRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for 500ms delay
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    // Cleanup timeout on unmount or when searchTerm changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch paginated data
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: debouncedSearchTerm, // Use debounced term for API calls
        statusFilter: statusFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      const response = await adminAPI.getStudentsPaginated(params);
      const {
        data,
        totalCount,
        pageNumber,
        pageSize: responsePageSize,
        totalPages: responseTotalPages,
      } = response.data;

      setStudents(data || []);
      setTotalItems(totalCount);
      setTotalPages(responseTotalPages);
      setCurrentPage(pageNumber);
      setPageSize(responsePageSize);

      // Clear any previous errors when we get a successful response
      setError("");

      // Determine admin role based on response structure
      if (data && data.length > 0) {
        // Check if the first student has interview scores (Admin dashboard)
        const firstStudent = data[0];
        if (
          Object.prototype.hasOwnProperty.call(
            firstStudent,
            "interviewScore"
          ) ||
          Object.prototype.hasOwnProperty.call(firstStudent, "InterviewScore")
        ) {
          setCurrentAdminRole("Admin");
        } else {
          setCurrentAdminRole("SuperAdmin");
        }
      }
    } catch (err) {
      // Don't treat empty results as errors - this is normal for filters
      if (err.response?.status === 404) {
        setStudents([]);
        setTotalItems(0);
        setTotalPages(0);
        setError(""); // Clear any previous errors
      } else {
        setError(err.response?.data || "Failed to fetch students");
        setStudents([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    statusFilter,
    sortBy,
    sortOrder,
  ]); // Use debouncedSearchTerm here

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Handle search (immediate UI update, debounced API call)
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
        // Toggle sort order if same column
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        // New column, default to ascending
        setSortBy(newSortBy);
        setSortOrder("asc");
      }
      setCurrentPage(1); // Reset to first page when sorting
    },
    [sortBy, sortOrder]
  );

  // Refresh data (useful for after updates)
  const refreshData = useCallback(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    isLoading,
    error,
    searchTerm,
    debouncedSearchTerm,
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
