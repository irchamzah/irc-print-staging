"use client";
import { useState, useEffect } from "react";

// PrinterFormModal
export const PrinterFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  printer,
  error,
  processing,
}) => {
  // Default paper sizes yang didukung
  const ALL_PAPER_SIZES = [
    "A4",
    "F4",
    "Letter",
    "Legal",
    "A5",
    "B5",
    "4x6",
    "5x7",
    "8x10",
    "10x15",
    "A3",
  ];
  const ALL_QUALITIES = ["draft", "normal", "high"];
  const ALL_COLOR_MODES = ["color", "monochrome"];

  const [formData, setFormData] = useState({
    printerId: "",
    name: "",
    modelId: "model_canon_g1010", // Default model ID
    model: "",
    location: {
      address: "",
      city: "",
      province: "",
      coordinates: {
        type: "Point",
        coordinates: [0, 0],
      },
      mapsUrl: "",
    },
    paperMode: "limited", // "limited" atau "unlimited"
    enabledFeatures: {
      paperSizes: ["A4", "F4"],
      colorModes: ["color", "monochrome"],
      qualities: ["normal", "high"],
      borderlessSizes: [],
      duplex: {
        enabled: false,
        type: null, // null, "manual", "automatic"
      },
    },
    ownerPrices: {
      monochrome: {},
      color: {},
    },
    markup: {
      monochrome: {},
      color: {},
    },
    volumeDiscounts: [
      { minSheets: 5, maxSheets: 9, discountPercent: 10 },
      { minSheets: 10, maxSheets: 14, discountPercent: 20 },
      { minSheets: 15, maxSheets: null, discountPercent: 30 },
    ],
    extraFees: {
      highQuality: { enabled: false, feePercent: 0 },
    },
    pointDivider: 4000,
    paperStatus: {
      available: true,
      paperCount: 0,
      activePaperSize: "A4",
      lastRefillDate: null,
      lastPrintDate: null,
    },
    operatingHours: {
      open: "00:00",
      close: "24:00",
      timezone: "Asia/Jakarta",
      is24Hours: true,
    },
    contact: {
      phone: [],
      email: "",
    },
    status: "offline",
  });

  // Update formData ketika printer berubah (untuk edit)
  useEffect(() => {
    if (printer) {
      // Inisialisasi ownerPrices dan markup untuk semua ukuran jika belum ada
      const initPrices = (pricesObj, defaultPrice) => {
        const result = { ...pricesObj };
        for (const size of ALL_PAPER_SIZES) {
          if (!result[size]) result[size] = defaultPrice;
        }
        return result;
      };

      const ownerPrices = printer.ownerPrices || { monochrome: {}, color: {} };
      const markup = printer.markup || { monochrome: {}, color: {} };

      setFormData({
        printerId: printer.printerId || "",
        name: printer.name || "",
        modelId: printer.modelId || "model_canon_g1010",
        model: printer.model || "",
        location: {
          address: printer.location?.address || "",
          city: printer.location?.city || "",
          province: printer.location?.province || "",
          coordinates: {
            type: "Point",
            coordinates: printer.location?.coordinates?.coordinates || [0, 0],
          },
          mapsUrl: printer.location?.mapsUrl || "",
        },
        paperMode: printer.paperMode || "limited",
        enabledFeatures: printer.enabledFeatures || {
          paperSizes: ["A4", "F4"],
          colorModes: ["color", "monochrome"],
          qualities: ["normal", "high"],
          borderlessSizes: [],
          duplex: { enabled: false, type: null },
        },
        ownerPrices: {
          monochrome: initPrices(ownerPrices.monochrome, 400),
          color: initPrices(ownerPrices.color, 1400),
        },
        markup: {
          monochrome: initPrices(markup.monochrome, 100),
          color: initPrices(markup.color, 100),
        },
        volumeDiscounts: printer.volumeDiscounts || [
          { minSheets: 5, maxSheets: 9, discountPercent: 10 },
          { minSheets: 10, maxSheets: 14, discountPercent: 20 },
          { minSheets: 15, maxSheets: null, discountPercent: 30 },
        ],
        extraFees: printer.extraFees || {
          highQuality: { enabled: false, feePercent: 0 },
        },
        pointDivider: printer.pointDivider || 4000,
        paperStatus: printer.paperStatus || {
          available: true,
          paperCount: 0,
          activePaperSize: "A4",
          lastRefillDate: null,
          lastPrintDate: null,
        },
        operatingHours: printer.operatingHours || {
          open: "00:00",
          close: "24:00",
          timezone: "Asia/Jakarta",
          is24Hours: true,
        },
        contact: {
          phone: printer.contact?.phone || [],
          email: printer.contact?.email || "",
        },
        status: printer.status || "offline",
      });
    } else {
      // Reset ke default untuk create new
      const defaultMonochrome = {};
      const defaultColor = {};
      const defaultMarkupMonochrome = {};
      const defaultMarkupColor = {};

      for (const size of ALL_PAPER_SIZES) {
        defaultMonochrome[size] = 400;
        defaultColor[size] = 1400;
        defaultMarkupMonochrome[size] = 100;
        defaultMarkupColor[size] = 100;
      }

      setFormData({
        printerId: "",
        name: "",
        modelId: "model_canon_g1010",
        model: "",
        location: {
          address: "",
          city: "",
          province: "",
          coordinates: {
            type: "Point",
            coordinates: [0, 0],
          },
          mapsUrl: "",
        },
        paperMode: "limited",
        enabledFeatures: {
          paperSizes: ["A4", "F4"],
          colorModes: ["color", "monochrome"],
          qualities: ["normal", "high"],
          borderlessSizes: [],
          duplex: { enabled: false, type: null },
        },
        ownerPrices: {
          monochrome: defaultMonochrome,
          color: defaultColor,
        },
        markup: {
          monochrome: defaultMarkupMonochrome,
          color: defaultMarkupColor,
        },
        volumeDiscounts: [
          { minSheets: 5, maxSheets: 9, discountPercent: 10 },
          { minSheets: 10, maxSheets: 14, discountPercent: 20 },
          { minSheets: 15, maxSheets: null, discountPercent: 30 },
        ],
        extraFees: {
          highQuality: { enabled: false, feePercent: 0 },
        },
        pointDivider: 4000,
        paperStatus: {
          available: true,
          paperCount: 0,
          activePaperSize: "A4",
          lastRefillDate: null,
          lastPrintDate: null,
        },
        operatingHours: {
          open: "00:00",
          close: "24:00",
          timezone: "Asia/Jakarta",
          is24Hours: true,
        },
        contact: {
          phone: [],
          email: "",
        },
        status: "offline",
      });
    }
  }, [printer]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Helper untuk update owner price per ukuran
  const updateOwnerPrice = (colorMode, paperSize, value) => {
    setFormData({
      ...formData,
      ownerPrices: {
        ...formData.ownerPrices,
        [colorMode]: {
          ...formData.ownerPrices[colorMode],
          [paperSize]: parseInt(value) || 0,
        },
      },
    });
  };

  // Helper untuk update markup per ukuran
  const updateMarkup = (colorMode, paperSize, value) => {
    setFormData({
      ...formData,
      markup: {
        ...formData.markup,
        [colorMode]: {
          ...formData.markup[colorMode],
          [paperSize]: parseInt(value) || 0,
        },
      },
    });
  };

  // Toggle paper size di enabledFeatures
  const togglePaperSize = (size) => {
    const currentSizes = [...formData.enabledFeatures.paperSizes];
    if (currentSizes.includes(size)) {
      setFormData({
        ...formData,
        enabledFeatures: {
          ...formData.enabledFeatures,
          paperSizes: currentSizes.filter((s) => s !== size),
        },
      });
    } else {
      setFormData({
        ...formData,
        enabledFeatures: {
          ...formData.enabledFeatures,
          paperSizes: [...currentSizes, size],
        },
      });
    }
  };

  // Toggle quality di enabledFeatures
  const toggleQuality = (quality) => {
    const currentQuality = [...formData.enabledFeatures.qualities];
    if (currentQuality.includes(quality)) {
      setFormData({
        ...formData,
        enabledFeatures: {
          ...formData.enabledFeatures,
          qualities: currentQuality.filter((q) => q !== quality),
        },
      });
    } else {
      setFormData({
        ...formData,
        enabledFeatures: {
          ...formData.enabledFeatures,
          qualities: [...currentQuality, quality],
        },
      });
    }
  };

  // Update volume discount
  const updateVolumeDiscount = (index, field, value) => {
    const newDiscounts = [...formData.volumeDiscounts];
    newDiscounts[index] = { ...newDiscounts[index], [field]: value };
    setFormData({ ...formData, volumeDiscounts: newDiscounts });
  };

  // Tambah volume discount
  const addVolumeDiscount = () => {
    setFormData({
      ...formData,
      volumeDiscounts: [
        ...formData.volumeDiscounts,
        { minSheets: 0, maxSheets: null, discountPercent: 0 },
      ],
    });
  };

  // Hapus volume discount
  const removeVolumeDiscount = (index) => {
    const newDiscounts = formData.volumeDiscounts.filter((_, i) => i !== index);
    setFormData({ ...formData, volumeDiscounts: newDiscounts });
  };

  // Fungsi untuk menambah field nomor telepon
  const addPhoneField = () => {
    setFormData({
      ...formData,
      contact: {
        ...formData.contact,
        phone: [...formData.contact.phone, ""],
      },
    });
  };

  const removePhoneField = (index) => {
    const newPhones = formData.contact.phone.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      contact: {
        ...formData.contact,
        phone: newPhones,
      },
    });
  };

  const updatePhoneField = (index, value) => {
    const newPhones = [...formData.contact.phone];
    newPhones[index] = value;
    setFormData({
      ...formData,
      contact: {
        ...formData.contact,
        phone: newPhones,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
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

        {/* Form dengan tabs */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                📋 Informasi Dasar
              </h4>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    disabled={!!printer}
                  />
                  {printer && (
                    <p className="text-xs text-gray-500 mt-1">
                      Printer ID tidak dapat diubah
                    </p>
                  )}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model ID
                  </label>
                  <input
                    type="text"
                    value={formData.modelId}
                    onChange={(e) =>
                      setFormData({ ...formData, modelId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="model_canon_g1010"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Canon G1010 series"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paper Mode
                  </label>
                  <select
                    value={formData.paperMode}
                    onChange={(e) =>
                      setFormData({ ...formData, paperMode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="limited">Limited (Perlu Isi Kertas)</option>
                    <option value="unlimited">
                      Unlimited (Tidak Perlu Isi Kertas)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location (singkat) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">📍 Lokasi</h4>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                        location: {
                          ...formData.location,
                          city: e.target.value,
                        },
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
            </div>

            {/* Enabled Features - Paper Sizes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                📄 Ukuran Kertas (yang diaktifkan)
              </h4>
              <div className="flex flex-wrap gap-3">
                {ALL_PAPER_SIZES.map((size) => (
                  <label key={size} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={formData.enabledFeatures.paperSizes.includes(
                        size,
                      )}
                      onChange={() => togglePaperSize(size)}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Enabled Features - Qualities */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                🎨 Kualitas Print (yang diaktifkan)
              </h4>
              <div className="flex gap-3">
                {ALL_QUALITIES.map((quality) => (
                  <label key={quality} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={formData.enabledFeatures.qualities.includes(
                        quality,
                      )}
                      onChange={() => toggleQuality(quality)}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm capitalize">{quality}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duplex Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                🔄 Cetak 2 Sisi (Duplex)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enabledFeatures.duplex.enabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enabledFeatures: {
                            ...formData.enabledFeatures,
                            duplex: {
                              ...formData.enabledFeatures.duplex,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      Aktifkan Duplex
                    </span>
                  </label>
                </div>
                {formData.enabledFeatures.duplex.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Duplex
                    </label>
                    <select
                      value={formData.enabledFeatures.duplex.type || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enabledFeatures: {
                            ...formData.enabledFeatures,
                            duplex: {
                              ...formData.enabledFeatures.duplex,
                              type: e.target.value || null,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Pilih Tipe</option>
                      <option value="manual">
                        Manual (Balik Kertas Sendiri)
                      </option>
                      <option value="automatic">Otomatis</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Harga (Owner Prices + Markup) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                💰 Harga (per lembar)
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                Harga Asli (Partner) + Markup (Platform) = Harga Final Pelanggan
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Ukuran</th>
                      <th className="text-left py-2">BW (Partner)</th>
                      <th className="text-left py-2">BW (Markup)</th>
                      <th className="text-left py-2">Color (Partner)</th>
                      <th className="text-left py-2">Color (Markup)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.enabledFeatures.paperSizes.map((size) => (
                      <tr key={size} className="border-b border-gray-100">
                        <td className="py-2 font-medium">{size}</td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={formData.ownerPrices.monochrome?.[size] ?? 0}
                            onChange={(e) =>
                              updateOwnerPrice(
                                "monochrome",
                                size,
                                e.target.value,
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={formData.markup.monochrome?.[size] ?? 0}
                            onChange={(e) =>
                              updateMarkup("monochrome", size, e.target.value)
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={formData.ownerPrices.color?.[size] ?? 0}
                            onChange={(e) =>
                              updateOwnerPrice("color", size, e.target.value)
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={formData.markup.color?.[size] ?? 0}
                            onChange={(e) =>
                              updateMarkup("color", size, e.target.value)
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Volume Discounts */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                📊 Diskon Volume (BW)
              </h4>
              {formData.volumeDiscounts.map((discount, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="number"
                    value={discount.minSheets}
                    onChange={(e) =>
                      updateVolumeDiscount(
                        index,
                        "minSheets",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={
                      discount.maxSheets === null ? "" : discount.maxSheets
                    }
                    onChange={(e) =>
                      updateVolumeDiscount(
                        index,
                        "maxSheets",
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                    placeholder="Max"
                  />
                  <span>→</span>
                  <input
                    type="number"
                    value={discount.discountPercent ?? 0}
                    onChange={(e) =>
                      updateVolumeDiscount(
                        index,
                        "discountPercent",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                    placeholder="%"
                  />
                  {formData.volumeDiscounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVolumeDiscount(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addVolumeDiscount}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700"
              >
                + Tambah Tier
              </button>
            </div>

            {/* Point Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                🎯 Point Settings
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Point Divider (Rp per point)
                </label>
                <input
                  type="number"
                  value={formData.pointDivider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pointDivider: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="100"
                  step="100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Contoh: 4000 → setiap Rp 4.000 = 1 point
                </p>
              </div>
            </div>

            {/* Profit Distribution Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                📊 Profit Distribution
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                Persentase profit partner berdasarkan siapa yang mengisi kertas
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Isi Sendiri (%)
                  </label>
                  <input
                    type="number"
                    value={
                      formData.profitDistribution?.partnerSelfRefill ?? 100
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitDistribution: {
                          ...formData.profitDistribution,
                          partnerSelfRefill: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Profit partner jika mengisi kertas sendiri
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Isi (%)
                  </label>
                  <input
                    type="number"
                    value={formData.profitDistribution?.adminRefill ?? 50}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitDistribution: {
                          ...formData.profitDistribution,
                          adminRefill: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Profit partner jika admin yang mengisi kertas
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">📞 Kontak</h4>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                {formData.contact.phone.map((phone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => updatePhoneField(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder={`Nomor telepon ${index + 1}`}
                    />
                    {formData.contact.phone.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhoneField(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPhoneField}
                  className="mt-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 flex items-center gap-2"
                >
                  + Tambah Nomor Telepon
                </button>
              </div>
            </div>

            {/* Paper Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                📄 Status Kertas
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.paperStatus.available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paperStatus: {
                            ...formData.paperStatus,
                            available: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      Kertas Tersedia
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Kertas
                  </label>
                  <input
                    type="number"
                    value={formData.paperStatus.paperCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paperStatus: {
                          ...formData.paperStatus,
                          paperCount: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kertas Aktif
                  </label>
                  <select
                    value={formData.paperStatus.activePaperSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paperStatus: {
                          ...formData.paperStatus,
                          activePaperSize: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {formData.enabledFeatures.paperSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {processing
              ? "Memproses..."
              : printer
                ? "Update Printer"
                : "Tambah Printer"}
          </button>
        </div>
      </div>
    </div>
  );
};
