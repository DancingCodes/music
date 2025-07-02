class Toast {
    private static readonly MAX_TOASTS = 10;
    private static container: HTMLDivElement;
    private static initialized = false;

    static success(message: string) {
        this.show(message, 'rgba(0, 0, 0, 0.3)');
    }

    static error(message: string) {
        this.show(message, 'rgba(255, 0, 0, 0.6)');
    }

    private static initialize() {
        if (this.initialized) return;

        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '20px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.gap = '10px';
        this.container.style.zIndex = '1000';

        document.body.appendChild(this.container);
        this.initialized = true;
    }

    private static show(message: string, color: string) {
        this.initialize();

        // 移除最早的一个如果超过限制
        if (this.container.children.length >= this.MAX_TOASTS) {
            this.container.firstChild?.remove();
        }

        const toast = document.createElement('div');
        toast.textContent = message;

        // 基础样式
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.background = color;
        toast.style.color = 'white';
        toast.style.display = 'inline-block';
        toast.style.animation = 'opacityShow 0.3s linear';

        this.container.appendChild(toast);


        // 3秒后自动移除
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

export default Toast;