export const SubmitButton = ({ isLoading, advancedSettings, onSubmit }) => {
  if (!advancedSettings.cost || advancedSettings.cost <= 0) {
    return null;
  }

  return (
    <button
      type="submit"
      disabled={isLoading}
      onClick={onSubmit}
      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
          Memproses...
        </div>
      ) : (
        "💳 Bayar dan Print"
      )}
    </button>
  );
};
