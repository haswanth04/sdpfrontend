import { forwardRef } from 'react';

const FormField = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  options = [],
  ...rest
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700 dark:text-dark-text-primary mb-1">
          {label}
        </label>
      )}
      
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          ref={ref}
          className={`block w-full px-3 py-2 border border-neutral-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-bg-input dark:text-dark-text-primary text-sm ${error ? 'border-neutral-400 focus:ring-neutral-500 focus:border-neutral-500' : ''}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          ref={ref}
          placeholder={placeholder}
          className={`block w-full px-3 py-2 border border-neutral-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-bg-input dark:text-dark-text-primary text-sm ${error ? 'border-neutral-400 focus:ring-neutral-500 focus:border-neutral-500' : ''}`}
          rows={4}
          {...rest}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          placeholder={placeholder}
          className={`block w-full px-3 py-2 border border-neutral-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-bg-input dark:text-dark-text-primary text-sm ${error ? 'border-neutral-400 focus:ring-neutral-500 focus:border-neutral-500' : ''}`}
          {...rest}
        />
      )}
      
      {error && <p className="mt-1 text-sm text-neutral-500 dark:text-dark-text-secondary">{error}</p>}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;