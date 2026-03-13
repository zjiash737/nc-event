#!/usr/bin/env python3
import qrcode

# 生成二维码 - 使用正确的Vercel地址
url = "https://nc-event-git-main-zjiash737s-projects.vercel.app/submit.html"
qr = qrcode.QRCode(version=1, box_size=10, border=2)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="white", back_color="black")
img.save('/Users/ZhuJia/.openclaw/workspace/nc-event/assets/qr-code.png')
print(f"QR code generated for: {url}")
