import { toast as originalToast } from 'react-toastify';

/**
 * Custom wrapper for react-toastify's toast
 */
const customToast = (content, options) => {
    return originalToast(content, options);
};

customToast.success = (content, options) => {
    return originalToast.success(content, options);
};

customToast.error = (content, options) => {
    return originalToast.error(content, options);
};

customToast.warning = (content, options) => {
    return originalToast.warning(content, options);
};

customToast.info = (content, options) => {
    return originalToast.info(content, options);
};

// Re-export other methods/properties so we don't break react-toastify usage
customToast.dismiss = originalToast.dismiss;
customToast.isActive = originalToast.isActive;
customToast.update = originalToast.update;
customToast.done = originalToast.done;
customToast.onChange = originalToast.onChange;
customToast.POSITION = originalToast.POSITION;
customToast.TYPE = originalToast.TYPE;

export { customToast as toast };
