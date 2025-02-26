// src/components/common/LoadingIndicator.jsx
export function LoadingIndicator({ message = "Caricamento..." }) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-xl text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          {message}
        </div>
      </div>
    );
  }