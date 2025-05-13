// utils/transition-helper.js
export function transitionHelper({ skipTransition = false, updateDOM }) {
  // Check if the browser supports View Transitions API
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => {});
    return {
      ready: Promise.reject(Error("View transitions unsupported")),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }
  // Use the View Transitions API
  return document.startViewTransition(updateDOM);
}
