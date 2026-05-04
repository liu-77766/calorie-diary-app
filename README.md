# 热量日记

一个手机优先的热量记录 PWA。可以记录早餐、午餐、晚餐、加餐，按食物份量估算热量，也可以直接输入包装上的 kJ 换算成 kcal。

## iPhone 使用

这个项目已经部署成 PWA。iPhone 上请用 Safari 打开：

https://calorie-diary-app.vercel.app

然后点击分享按钮，选择“添加到主屏幕”。添加后会像普通 App 一样从桌面打开。

如果要做成真正的 App Store 安装包，需要 Apple Developer 账号、Xcode、签名证书和上架流程。当前 PWA 是最轻量、最适合个人使用的方式。

## 图片识别

图片识别使用百度图像识别组合接口，包含菜品识别、果蔬/食材识别、通用物体识别和图像主体检测。

百度识别出食物名称后，DeepSeek 会根据名称估算常见可食克数和每 100g 热量。前端会自动填入结果，但重量和热量只是估算，用户可以手动修改。

## 环境变量

本地 `.env.local` 或 Vercel Environment Variables 需要配置：

- `AI_PROVIDER=baidu`
- `BAIDU_API_KEY=你的百度 API Key`
- `BAIDU_SECRET_KEY=你的百度 Secret Key`
- `DEEPSEEK_API_KEY=你的 DeepSeek API Key`
- `DEEPSEEK_MODEL=deepseek-v4-flash`
