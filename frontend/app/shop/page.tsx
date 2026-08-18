"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card";
import { Product, Category } from "@/types";
import ShopToolbar from "@/components/shop/shop-toolbar";
import ShopFilters from "@/components/shop/shop-filters";
import { ShoppingBag } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

function ShopContent() {
  const searchParams = useSearchParams();

  // Parse Initial URL Query Parameters
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialSort = searchParams.get("sort") || searchParams.get("sortBy") || "featured";
  const initialAvailability =
    searchParams.get("availability") ||
    (searchParams.get("inStock") === "true"
      ? "in-stock"
      : searchParams.get("inStock") === "false"
      ? "out-of-stock"
      : "");
  const initialFeatured = searchParams.get("featured") === "true";
  const initialNew = searchParams.get("filter") === "new" || searchParams.get("newArrival") === "true";

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>(initialAvailability);
  const [isFeaturedOnly, setIsFeaturedOnly] = useState<boolean>(initialFeatured);
  const [isNewOnly, setIsNewOnly] = useState<boolean>(initialNew);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  // Debounce search query input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync URL params when searchParams change externally
  useEffect(() => {
    if (searchParams.get("search") !== null || searchParams.get("q") !== null) {
      const s = searchParams.get("search") || searchParams.get("q") || "";
      setSearchQuery(s);
      setDebouncedSearch(s);
    }
    if (searchParams.get("category") !== null) {
      setSelectedCategory(searchParams.get("category") || "");
    }
    if (searchParams.get("sort") !== null || searchParams.get("sortBy") !== null) {
      setSortBy(searchParams.get("sort") || searchParams.get("sortBy") || "featured");
    }
    if (searchParams.get("availability") !== null || searchParams.get("inStock") !== null) {
      const avail =
        searchParams.get("availability") ||
        (searchParams.get("inStock") === "true"
          ? "in-stock"
          : searchParams.get("inStock") === "false"
          ? "out-of-stock"
          : "");
      setAvailabilityFilter(avail);
    }
    if (searchParams.get("featured") !== null) {
      setIsFeaturedOnly(searchParams.get("featured") === "true");
    }
    if (searchParams.get("filter") !== null || searchParams.get("newArrival") !== null) {
      setIsNewOnly(searchParams.get("filter") === "new" || searchParams.get("newArrival") === "true");
    }
  }, [searchParams]);

  // Update browser URL without reloading page
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (availabilityFilter) params.set("availability", availabilityFilter);
    if (isFeaturedOnly) params.set("featured", "true");
    if (isNewOnly) params.set("filter", "new");
    if (sortBy && sortBy !== "featured") params.set("sort", sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `/shop?${queryString}` : "/shop";
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newUrl);
    }
  }, [debouncedSearch, selectedCategory, availabilityFilter, isFeaturedOnly, isNewOnly, sortBy]);

  // Fetch Categories once on mount
  useEffect(() => {
    let isSubscribed = true;
    async function loadCategories() {
      try {
        const catRes = await apiFetch("/api/categories");
        const catJson = await catRes.json();
        if (!isSubscribed) return;
        if (catJson.success && Array.isArray(catJson.data)) {
          setCategories(catJson.data);
        } else if (Array.isArray(catJson)) {
          setCategories(catJson);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Compute Active Category Object for Header Display
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    const lower = selectedCategory.toLowerCase();
    return (
      categories.find(
        (c) =>
          (c.slug && c.slug.toLowerCase() === lower) ||
          (c.name && c.name.toLowerCase() === lower) ||
          c.id === selectedCategory
      ) || null
    );
  }, [categories, selectedCategory]);

  const categoryHeading = activeCategoryObj
    ? activeCategoryObj.name
    : selectedCategory
    ? selectedCategory
    : "Shop All Products";

  // Helper to construct query string
  const buildQueryParams = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", "24");
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (selectedCategory) params.set("category", selectedCategory);
      if (availabilityFilter === "in-stock") params.set("inStock", "true");
      else if (availabilityFilter === "out-of-stock") params.set("inStock", "false");
      if (isFeaturedOnly) params.set("featured", "true");
      if (isNewOnly) params.set("newArrival", "true");
      if (sortBy) params.set("sort", sortBy);
      return params.toString();
    },
    [debouncedSearch, selectedCategory, availabilityFilter, isFeaturedOnly, isNewOnly, sortBy]
  );

  // Fetch Products Page 1 and reset on Filter/Sort changes
  useEffect(() => {
    let isSubscribed = true;
    const currentReqId = ++requestIdRef.current;

    async function loadInitialProducts() {
      try {
        setLoading(true);
        setPage(1);
        const queryStr = buildQueryParams(1);
        const prodRes = await apiFetch(`/api/products?${queryStr}`);
        const prodJson = await prodRes.json();

        if (!isSubscribed || currentReqId !== requestIdRef.current) return;

        if (prodJson.success && Array.isArray(prodJson.data)) {
          setProducts(prodJson.data);
          const meta = prodJson.pagination;
          if (meta) {
            setTotalPages(meta.totalPages || 1);
            setTotalProducts(meta.total ?? prodJson.data.length);
          } else {
            setTotalPages(1);
            setTotalProducts(prodJson.data.length);
          }
        } else if (Array.isArray(prodJson)) {
          setProducts(prodJson);
          setTotalPages(1);
          setTotalProducts(prodJson.length);
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error("Error loading shop products:", err);
      } finally {
        if (isSubscribed && currentReqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    loadInitialProducts();

    return () => {
      isSubscribed = false;
    };
  }, [buildQueryParams]);

  // Load Next Page for Infinite Scroll
  const loadNextPage = useCallback(async () => {
    if (loading || loadingMore || page >= totalPages) return;

    const currentReqId = requestIdRef.current;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const queryStr = buildQueryParams(nextPage);
      const res = await apiFetch(`/api/products?${queryStr}`);
      const json = await res.json();

      if (currentReqId !== requestIdRef.current) return;

      if (json.success && Array.isArray(json.data)) {
        const newItems: Product[] = json.data;
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewItems = newItems.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewItems];
        });
        setPage(nextPage);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalProducts(json.pagination.total ?? 0);
        }
      }
    } catch (err) {
      console.error("Error loading next product batch:", err);
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [loading, loadingMore, page, totalPages, buildQueryParams]);

  // IntersectionObserver for Sentinel Element
  useEffect(() => {
    if (loading || loadingMore || page >= totalPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "300px" }
    );

    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [loading, loadingMore, page, totalPages, loadNextPage]);

  // Compute Active Filter Count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch.trim()) count++;
    if (selectedCategory) count++;
    if (availabilityFilter) count++;
    if (isFeaturedOnly) count++;
    if (isNewOnly) count++;
    return count;
  }, [debouncedSearch, selectedCategory, availabilityFilter, isFeaturedOnly, isNewOnly]);

  const handleClearAll = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setAvailabilityFilter("");
    setIsFeaturedOnly(false);
    setIsNewOnly(false);
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-popover/30 border-b border-[#B67B5C]/30 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-primary/20 text-xs font-semibold text-primary mb-3">
            <ShoppingBag size={14} />
            <span>Complete Catalogue</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {categoryHeading}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Browse our full collection of handcrafted designer kurtis, ethnic wear, and luxury attire.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <ShopFilters
                categories={categories}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                availabilityFilter={availabilityFilter}
                onSelectAvailability={setAvailabilityFilter}
                isFeaturedOnly={isFeaturedOnly}
                onToggleFeatured={setIsFeaturedOnly}
                isNewOnly={isNewOnly}
                onToggleNew={setIsNewOnly}
                onClearAll={handleClearAll}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>

          {/* Product Listing Area */}
          <div className="lg:col-span-3">
            <ShopToolbar
              totalProducts={totalProducts || products.length}
              displayedCount={products.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
              activeFilterCount={activeFilterCount}
            />

            {/* Loading Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 bg-popover/20 border border-dashed border-primary/30 rounded-xl p-8">
                <ShoppingBag size={36} className="mx-auto text-primary/60 mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">No Products Found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                  We couldn&apos;t find any products matching your current search or filters. Try resetting or selecting a different category.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-5 py-2.5 bg-foreground text-background text-xs sm:text-sm font-bold rounded-md hover:bg-secondary transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Product Grid + Infinite Scroll Footer */
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Additional Batch Loading Skeleton */}
                {loadingMore && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-6 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div key={`load-more-skeleton-${i}`} className="h-80 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                )}

                {/* Sentinel Target Element for Infinite Scroll */}
                <div ref={sentinelRef} className="h-10 w-full" />

                {/* End of Collection Banner */}
                {!loadingMore && page >= totalPages && products.length > 0 && (
                  <div className="text-center py-8 my-6 text-xs sm:text-sm font-medium text-muted-foreground border-t border-border/40">
                    <span>✨ You&apos;re all caught up. You&apos;ve reached the end.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFiltersOpen && (
        <ShopFilters
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          availabilityFilter={availabilityFilter}
          onSelectAvailability={setAvailabilityFilter}
          isFeaturedOnly={isFeaturedOnly}
          onToggleFeatured={setIsFeaturedOnly}
          isNewOnly={isNewOnly}
          onToggleNew={setIsNewOnly}
          onClearAll={handleClearAll}
          activeFilterCount={activeFilterCount}
          isMobileModal={true}
          onCloseMobileModal={() => setIsMobileFiltersOpen(false)}
        />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="animate-pulse text-sm text-primary font-bold">Loading catalogue...</div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
