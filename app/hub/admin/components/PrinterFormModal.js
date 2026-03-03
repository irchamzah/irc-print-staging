"use client";
import { useState } from "react";

export const PrinterFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  printer,
  error,
  processing,
}) => {
  const [formData, setFormData] = useState({
    printerId: printer?.printerId || "",
    name: printer?.name || "",
    location: {
      address: printer?.location?.address || "",
      city: printer?.location?.city || "",
      province: printer?.location?.province || "",
      coordinates: {
        type: "Point",
        coordinates: printer?.location?.coordinates?.coordinates || [0, 0],
      },
    },
    pricing: printer?.pricing || {
      color: 1500,
      bw: 500,
      bwTiers: [
        { minSheets: 1, price: 500 },
        { minSheets: 5, price: 400 },
        { minSheets: 10, price: 360 },
        { minSheets: 15, price: 333 },
        { minSheets: 20, price: 300 },
      ],
    },
    profitSettings: printer?.profitSettings || {
      defaultShare: 20,
      partnerShare: 30,
      paperPackSize: 80,
    },
    paperStatus: printer?.paperStatus || {
      paperCount: 100,
      available: true,
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateBwTier = (index, field, value) => {
    const newTiers = [...formData.pricing.bwTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setFormData({
      ...formData,
      pricing: { ...formData.pricing, bwTiers: newTiers },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {printer ? "Edit Printer" : "Tambah Printer Baru"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Printer ID
                </label>
                <input
                  type="text"
                  value={formData.printerId}
                  onChange={(e) =>
                    setFormData({ ...formData, printerId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Printer
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kota
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={formData.location.province}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        province: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-800 mb-3">💰 Pricing</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Warna (A4)
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          color: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga BW (A4)
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.bw}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          bw: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <h5 className="text-sm font-medium text-gray-700 mb-2">
                BW Tiers (minSheets - price)
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {formData.pricing.bwTiers.map((tier, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="number"
                      value={tier.minSheets}
                      onChange={(e) =>
                        updateBwTier(
                          index,
                          "minSheets",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) =>
                        updateBwTier(index, "price", parseInt(e.target.value))
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      placeholder="Price"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Profit Settings */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-800 mb-3">
                📊 Profit Settings
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Share (%)
                  </label>
                  <input
                    type="number"
                    value={formData.profitSettings.defaultShare}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitSettings: {
                          ...formData.profitSettings,
                          defaultShare: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Share (%)
                  </label>
                  <input
                    type="number"
                    value={formData.profitSettings.partnerShare}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitSettings: {
                          ...formData.profitSettings,
                          partnerShare: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paper Pack Size
                  </label>
                  <input
                    type="number"
                    value={formData.profitSettings.paperPackSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitSettings: {
                          ...formData.profitSettings,
                          paperPackSize: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </div>
            ) : printer ? (
              "Update"
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
