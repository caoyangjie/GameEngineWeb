# 删除dist.zip
rm -f dist.zip

# 编译版本
npm run build

# 压缩包
zip -r dist.zip dist

# 上传到服务器
sh ~/bin/scpAws.sh dist.zip /data/nginx/html/dist.zip