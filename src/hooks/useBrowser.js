import { useState, useEffect } from "react";

/**
 * Hook to get the current active tab information
 * @returns {Object} - Tab information and loading state
 */
export const useActiveTab = () => {
  const [tabInfo, setTabInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getActiveTab = async () => {
      try {
        setLoading(true);

        // Query for the active tab
        const tabs = await new Promise((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs);
          });
        });

        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];

          // Get content from the active tab
          const content = await new Promise((resolve) => {
            chrome.tabs.sendMessage(
              activeTab.id,
              { action: "getPageContent" },
              (response) => {
                // If there's no response, it might be because the content script isn't loaded
                resolve(
                  response || {
                    title: activeTab.title,
                    url: activeTab.url,
                  }
                );
              }
            );
          });

          setTabInfo({
            id: activeTab.id,
            url: activeTab.url,
            title: activeTab.title,
            favIconUrl: activeTab.favIconUrl,
            ...content,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error getting active tab:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    getActiveTab();
  }, []);

  return { tabInfo, loading, error };
};

/**
 * Hook to manage extension theme
 * @returns {Object} - Current theme and function to toggle theme
 */
export const useTheme = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Load theme from storage
    chrome.storage.local.get("settings", (result) => {
      if (result.settings?.theme) {
        setTheme(result.settings.theme);
        applyTheme(result.settings.theme);
      }
    });

    // Listen for theme changes
    const handleStorageChange = (changes, area) => {
      if (area === "local" && changes.settings?.newValue?.theme) {
        setTheme(changes.settings.newValue.theme);
        applyTheme(changes.settings.newValue.theme);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    // Update storage
    chrome.storage.local.get("settings", (result) => {
      const settings = result.settings || {};
      chrome.storage.local.set({
        settings: {
          ...settings,
          theme: newTheme,
        },
      });
    });

    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (themeName) => {
    document.body.classList.toggle("dark-theme", themeName === "dark");
  };

  return { theme, toggleTheme };
};
