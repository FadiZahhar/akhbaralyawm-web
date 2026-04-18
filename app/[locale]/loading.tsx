export default function Loading() {
  return (
    <div className="page-preloader" role="status" aria-label="Loading">
      <div className="preloader-content">
        {/* Branded CSS spinner — navy + green rings */}
        <div className="preloader-spinner">
          <div className="spinner-ring spinner-ring-outer" />
          <div className="spinner-ring spinner-ring-inner" />
          <div className="spinner-dot" />
        </div>
        <div className="preloader-bar">
          <div className="preloader-bar-fill" />
        </div>
      </div>
    </div>
  );
}
