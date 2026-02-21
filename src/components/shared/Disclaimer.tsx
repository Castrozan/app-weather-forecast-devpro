const DISCLAIMER_SIDEBAR_TEXT = `The information provided by this weather application is for general informational purposes only. All weather data, forecasts, and alerts are obtained from third-party sources and are provided "as is" without warranty of any kind, either express or implied. While we strive to provide accurate and timely information, we make no representations or warranties of any kind regarding the accuracy, completeness, reliability, or suitability of the weather data presented.`;

const DISCLAIMER_PANEL_TEXT = `Users are advised to consult official government sources and exercise their own judgment when making decisions based on weather conditions. The App and its developers are not liable for any direct, indirect, incidental, or consequential damages or losses arising from the use of or reliance on information provided by the App.
By using this App, you agree to assume full responsibility for any decisions or actions taken based on its content.`;

export const SidebarDisclaimer = () => {
  return <small className="disclaimer">{DISCLAIMER_SIDEBAR_TEXT}</small>;
};

export const PanelDisclaimer = () => {
  return <small className="disclaimer">{DISCLAIMER_PANEL_TEXT}</small>;
};
