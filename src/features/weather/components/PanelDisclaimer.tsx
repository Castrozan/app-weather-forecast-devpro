const PANEL_DISCLAIMER_TEXT = `Users are advised to consult official government sources and exercise their own judgment when making decisions based on weather conditions. The App and its developers are not liable for any direct, indirect, incidental, or consequential damages or losses arising from the use of or reliance on information provided by the App.
By using this App, you agree to assume full responsibility for any decisions or actions taken based on its content.`;

export const PanelDisclaimer = () => {
  return <small className="disclaimer">{PANEL_DISCLAIMER_TEXT}</small>;
};
