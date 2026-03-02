#!/bin/bash
# 每5分钟更新一次metrics.json数据

cd /home/ubuntu/networkops-gate-main

# 检查并生成metrics数据
if [ -f "/var/log/nginx/access.log" ]; then
    python3 scripts/generate_metrics_from_nginx.py \
        --log /var/log/nginx/access.log /var/log/nginx/access.log.1 \
        --output web/data/metrics.json
    
    if [ $? -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Metrics updated successfully"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Failed to update metrics"
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Nginx access.log not found"
fi