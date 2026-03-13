#!/usr/bin/env python3
from PIL import Image
import os

# 读取logo图片
img = Image.open('/Users/ZhuJia/.openclaw/workspace/nc-event/assets/company-logos.png')
width, height = img.size

# 企业名称列表
companies = [
    '云快充', '博云科技', '零一汽车', '苏度科技', 'XREAL',
    '灵猴机器人', '恩井智控', '图达通', '车小多', '主线科技',
    '能链控股', '车林子', '海微科技', '思特光学'
]

# 计算每个logo的宽度
logo_width = width // len(companies)

# 创建输出目录
output_dir = '/Users/ZhuJia/.openclaw/workspace/nc-event/assets/logos'
os.makedirs(output_dir, exist_ok=True)

# 裁切每个logo
for i, company in enumerate(companies):
    left = i * logo_width
    right = (i + 1) * logo_width
    logo = img.crop((left, 0, right, height))
    
    # 保存logo
    filename = f'{company}.png'.replace('/', '_')
    logo.save(os.path.join(output_dir, filename))
    print(f'Saved {filename}')

print('Done!')
