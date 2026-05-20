# packages 目录说明

本目录用于存放 **可直接在 Komari 管理后台的主题管理页面上传** 的 zip 主题包。

推荐使用：

* `komari-next-upload-ready-20260516-155451.zip`

该包的 ZIP 根目录直接包含：

* `dist/`
* `komari-theme.json`
* `preview.png`

适用场景：

* 不想自行构建前端
* 不想手动整理 `dist/` 与主题描述文件
* 希望直接上传后启用主题

使用方式：

1. 打开 Komari 管理后台。
2. 进入主题管理。
3. 选择本目录中的 zip 包上传。
4. 上传完成后启用主题即可。

校验要点：

* 解压后不要再出现额外的上层目录
* 如果 ZIP 根目录不是直接看到 `dist/`、`komari-theme.json`、`preview.png`，说明包结构不适合后台直接上传
