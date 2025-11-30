#!/usr/bin/env python3
import subprocess
import sys

def get_gpu_info():
    result = subprocess.run(
        ['nvidia-smi', '--query-gpu=index,memory.used,memory.total,utilization.gpu', 
         '--format=csv,noheader,nounits'],
        capture_output=True, text=True
    )
    
    gpus = []
    for line in result.stdout.strip().split('\n'):
        idx, mem_used, mem_total, util = line.split(', ')
        gpus.append({
            'index': int(idx),
            'mem_used': int(mem_used),
            'mem_total': int(mem_total),
            'mem_free': int(mem_total) - int(mem_used),
            'utilization': int(util)
        })
    return gpus

def select_best_gpu(gpus):
    # 优先选择显存空闲最多且利用率最低的GPU
    best = min(gpus, key=lambda g: (g['mem_used'], g['utilization']))
    return best['index']

if __name__ == '__main__':
    gpus = get_gpu_info()
    best_gpu = select_best_gpu(gpus)
    print(best_gpu)
