import moment from "moment";

// Obsidian 透過 window.moment 暴露 moment，測試中模擬此行為
(globalThis as any).window = {
  moment: Object.assign((...args: any[]) => (moment as any)(...args), moment),
};
