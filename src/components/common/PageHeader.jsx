import { Link } from 'react-router-dom';

const PageHeader = ({ title, subtitle, backLink, backLabel }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-neutral-600 dark:text-dark-text-secondary">{subtitle}</p>}
        </div>
        
        {backLink && (
          <div className="mt-4 sm:mt-0">
            <Link
              to={backLink}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-dark-border-primary rounded-md shadow-sm dark:shadow-dark-sm text-sm font-medium text-neutral-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg-secondary hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary focus:ring-primary-500"
            >
              ← {backLabel || 'Back'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;