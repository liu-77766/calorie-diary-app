# 热量日记

一个手机优先的热量记录 PWA。可以记录早餐、午餐、晚餐、加餐，按食物份量估算热量，也可以直接输入包装上的 kJ 换算成 kcal。

## 手机使用

当前文件可以直接在电脑浏览器打开预览。要在手机上像 App 一样使用，需要把这个项目发布到 HTTPS 网站上，然后用手机浏览器打开：

- Android：用 Chrome 打开后点页面里的“安装”，或浏览器菜单里的“添加到主屏幕”。
- iPhone：用 Safari 打开后点分享按钮，再选择“添加到主屏幕”。

如果要做成真正的 Android 安装包 APK，需要再接入 Capacitor 或原生 Android 打包工具。

## 拍照识别

页面已经有拍照/上传照片入口。真实识别需要在 Vercel 项目环境变量里配置 `OPENAI_API_KEY`，可选配置 `OPENAI_MODEL`。没有配置时，拍照识别会提示暂未开通，但手动记录不受影响。

也可以改用 Gemini：

- `AI_PROVIDER=gemini`
- `GEMINI_API_KEY=你的 Gemini API Key`
- `GEMINI_MODEL=gemini-2.5-flash` 或你账号实际可用的模型名

如果 Google 确认你的账号可用 `gemini-3.1-pro`，可以把 `GEMINI_MODEL` 设置为 `gemini-3.1-pro`。不设置 `AI_PROVIDER` 时默认仍使用 OpenAI。

也可以把拍照识别改用百度菜品识别：

- `AI_PROVIDER=baidu`
- `BAIDU_API_KEY=你的百度 API Key`
- `BAIDU_SECRET_KEY=你的百度 Secret Key`

百度菜品识别会返回菜品名称、置信度和参考卡路里。这个接口只适合“拍照识别”，不支持按食物名直接查询热量；食物名查询仍需使用内置库、手动输入，或改用 Gemini/OpenAI。

当前项目也支持用 DeepSeek 专门做热量估算：

- `DEEPSEEK_API_KEY=你的 DeepSeek API Key`
- `DEEPSEEK_MODEL=deepseek-v4-flash`

启用后，输入内置库没有的食物名会调用 DeepSeek 估算热量；百度拍照识别出食物名称后，也会用 DeepSeek 估算/校准每 100g 热量。
