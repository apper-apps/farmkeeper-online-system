import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import cropService from "@/services/api/cropService";
import farmService from "@/services/api/farmService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { format } from "date-fns";

const ReadyToHarvest = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cropsResponse, farmsResponse] = await Promise.all([
        cropService.getReadyToHarvest(currentPage, itemsPerPage),
        farmService.getAll()
      ]);

      // Enrich crops with farm names
      const enrichedCrops = cropsResponse.data.map(crop => ({
        ...crop,
        farmName: farmsResponse.data?.find(farm => {
          const cropFarmId = typeof crop.farmId === 'object' ? crop.farmId?.Id : crop.farmId;
          return farm.Id === cropFarmId;
        })?.Name || "Unknown Farm"
      }));

      setCrops(enrichedCrops);
      setFarms(farmsResponse.data || []);
      setTotalPages(Math.ceil(cropsResponse.total / itemsPerPage));
    } catch (err) {
      console.error("Error loading ready to harvest data:", err);
      setError(err.message);
      toast.error("Failed to load ready to harvest crops");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsHarvested = async (crop) => {
    if (!confirm(`Mark ${crop.Name} as harvested?`)) return;

    try {
      await cropService.update(crop.Id, {
        ...crop,
        status: 'harvested'
      });
      
      // Remove from current list since it's no longer "ready"
      setCrops(crops.filter(c => c.Id !== crop.Id));
      toast.success(`${crop.Name} marked as harvested!`);
    } catch (err) {
      console.error("Error updating crop status:", err);
      toast.error("Failed to mark crop as harvested");
    }
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.variety?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.farmName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
            <ApperIcon name="Harvest" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ready to Harvest</h1>
            <p className="text-gray-600">Crops that are ready for harvesting</p>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
<SearchBar
          value={searchTerm || ''}
          onChange={setSearchTerm}
          placeholder="Search crops, varieties, or farms..."
          className="w-full lg:w-96"
        />
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-4 py-2">
            <ApperIcon name="Calendar" size={16} className="mr-2" />
            {filteredCrops.length} Ready
          </Badge>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredCrops.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Empty
              icon="Harvest"
              title="No crops ready for harvest"
              description="When crops reach 'ready' status, they'll appear here for harvest management."
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-zebra">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Crop Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Farm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Planting Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Expected Harvest
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Area
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCrops.map((crop) => (
                    <tr key={crop.Id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{crop.Name}</span>
                          {crop.variety && (
                            <span className="text-sm text-gray-600">{crop.variety}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ApperIcon name="MapPin" size={16} className="text-gray-400" />
                          <span className="text-gray-900">{crop.farmName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {crop.plantingDate ? format(new Date(crop.plantingDate), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {crop.expectedHarvestDate ? format(new Date(crop.expectedHarvestDate), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {crop.area} units
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="status-ready">
                          <ApperIcon name="CheckCircle" size={14} className="mr-1" />
                          Ready
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarkAsHarvested(crop)}
                            className="flex items-center gap-2"
                          >
                            <ApperIcon name="Harvest" size={16} />
                            Mark Harvested
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ApperIcon name="ChevronLeft" size={16} />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ApperIcon name="ChevronRight" size={16} />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadyToHarvest;