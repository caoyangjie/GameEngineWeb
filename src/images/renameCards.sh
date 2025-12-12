#!/bin/bash

# 图像文件所在的子目录
image_dir="./cards"

# 定义扑克牌花色和牌面的数组
suits=("梅花" "黑桃" "红桃" "方块")
ranks=(A 2 3 4 5 6 7 8 9 10 J Q K)

# 遍历子目录中的文件
for file in "$image_dir"/card_*.png; do
    # 确保文件确实存在
    if [[ ! -f "$file" ]]; then
        echo "找不到任何符合条件的文件：$file"
        continue
    fi
    
    # 提取数字部分
    num=$(echo "$file" | grep -o '[0-9]\+')
    
    # 检查 num 是否为空
    if [[ -z "$num" ]]; then
        echo "文件名格式不正确：$file"
        continue
    fi
    
    # 确定花色和牌面
    if [[ "$num" -ge 0 && "$num" -le 12 ]]; then
        suit=${suits[0]}  # 梅花
        rank=${ranks[$num]}
    elif [[ "$num" -ge 13 && "$num" -le 25 ]]; then
        suit=${suits[1]}  # 黑桃
        rank=${ranks[$((num - 13))]}
    elif [[ "$num" -ge 26 && "$num" -le 38 ]]; then
        suit=${suits[2]}  # 红桃
        rank=${ranks[$((num - 26))]}
    elif [[ "$num" -ge 39 && "$num" -le 51 ]]; then
        suit=${suits[3]}  # 方块
        rank=${ranks[$((num - 39))]}
    else
        echo "文件名格式不正确：$file"
        continue
    fi
    
    # 构建新的文件名
    new_filename="${image_dir}/card_${suit}_${rank}.png"

    # 重命名文件
    mv "$file" "$new_filename"
    echo "重命名: $file -> $new_filename"
done

