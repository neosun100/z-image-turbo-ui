import { Info, X } from 'lucide-react'

const helpContent = {
  'zh-CN': {
    title: '使用说明',
    sections: [
      {
        title: '📝 提示词',
        content: '描述你想生成的图像。支持中英文。\n示例：一只可爱的猫咪，坐在窗台上，阳光洒在身上'
      },
      {
        title: '🚫 负面提示词',
        content: '描述你不想在图像中出现的元素。\n示例：模糊、低质量、变形、丑陋\n常用：blurry, low quality, distorted, ugly'
      },
      {
        title: '✨ 增强提示词',
        content: '自动在提示词前添加质量词，提升生成效果。\n会添加：masterpiece, best quality, highly detailed\n适合：想要更高质量但不想手动添加质量词时使用'
      },
      {
        title: '🎯 推理步数',
        content: '生成图像的迭代次数。\n推荐：8步（最佳平衡）\n更多步数：质量略好但速度慢\n更少步数：速度快但质量下降'
      },
      {
        title: '🎨 引导强度',
        content: 'Turbo模型推荐使用0.0\n较高值：更严格遵循提示词\n较低值：更多创意自由'
      },
      {
        title: '🔢 批量生成',
        content: '一次生成多张图片（1-4张）\n每张使用不同随机种子\n适合：需要多个变体时使用'
      },
      {
        title: '🎲 随机种子',
        content: '-1：每次随机生成\n固定数字：可重现相同结果\n用途：找到满意的图后，使用相同种子微调提示词'
      }
    ],
    modelInfo: {
      title: '📌 模型信息',
      content: '当前模型：Z-Image-Turbo\n类型：文生图（Text-to-Image）\n不支持：图生图（需要Z-Image-Edit）\n特点：6B参数，8步生成，支持中英文'
    }
  },
  'zh-TW': {
    title: '使用說明',
    sections: [
      {
        title: '📝 提示詞',
        content: '描述你想生成的圖像。支持中英文。\n示例：一隻可愛的貓咪，坐在窗台上，陽光灑在身上'
      },
      {
        title: '🚫 負面提示詞',
        content: '描述你不想在圖像中出現的元素。\n示例：模糊、低質量、變形、醜陋\n常用：blurry, low quality, distorted, ugly'
      },
      {
        title: '✨ 增強提示詞',
        content: '自動在提示詞前添加質量詞，提升生成效果。\n會添加：masterpiece, best quality, highly detailed\n適合：想要更高質量但不想手動添加質量詞時使用'
      },
      {
        title: '🎯 推理步數',
        content: '生成圖像的迭代次數。\n推薦：8步（最佳平衡）\n更多步數：質量略好但速度慢\n更少步數：速度快但質量下降'
      },
      {
        title: '🎨 引導強度',
        content: 'Turbo模型推薦使用0.0\n較高值：更嚴格遵循提示詞\n較低值：更多創意自由'
      },
      {
        title: '🔢 批量生成',
        content: '一次生成多張圖片（1-4張）\n每張使用不同隨機種子\n適合：需要多個變體時使用'
      },
      {
        title: '🎲 隨機種子',
        content: '-1：每次隨機生成\n固定數字：可重現相同結果\n用途：找到滿意的圖後，使用相同種子微調提示詞'
      }
    ],
    modelInfo: {
      title: '📌 模型信息',
      content: '當前模型：Z-Image-Turbo\n類型：文生圖（Text-to-Image）\n不支持：圖生圖（需要Z-Image-Edit）\n特點：6B參數，8步生成，支持中英文'
    }
  },
  'en': {
    title: 'User Guide',
    sections: [
      {
        title: '📝 Prompt',
        content: 'Describe the image you want to generate.\nExample: A cute cat sitting on a windowsill, sunlight shining on it'
      },
      {
        title: '🚫 Negative Prompt',
        content: 'Describe elements you don\'t want in the image.\nExample: blurry, low quality, distorted, ugly\nCommon: blurry, low quality, distorted, ugly'
      },
      {
        title: '✨ Enhance Prompt',
        content: 'Automatically adds quality keywords to your prompt.\nAdds: masterpiece, best quality, highly detailed\nUse when: You want higher quality without manually adding keywords'
      },
      {
        title: '🎯 Inference Steps',
        content: 'Number of iterations for image generation.\nRecommended: 8 steps (best balance)\nMore steps: Slightly better quality but slower\nFewer steps: Faster but lower quality'
      },
      {
        title: '🎨 Guidance Scale',
        content: 'Recommended 0.0 for Turbo model\nHigher: Stricter adherence to prompt\nLower: More creative freedom'
      },
      {
        title: '🔢 Batch Size',
        content: 'Generate multiple images at once (1-4)\nEach uses a different random seed\nUse when: You need multiple variations'
      },
      {
        title: '🎲 Seed',
        content: '-1: Random generation each time\nFixed number: Reproducible results\nUse: After finding a good image, use same seed to fine-tune prompt'
      }
    ],
    modelInfo: {
      title: '📌 Model Info',
      content: 'Current Model: Z-Image-Turbo\nType: Text-to-Image\nNot Supported: Image-to-Image (requires Z-Image-Edit)\nFeatures: 6B parameters, 8-step generation, bilingual support'
    }
  },
  'ja': {
    title: '使用ガイド',
    sections: [
      {
        title: '📝 プロンプト',
        content: '生成したい画像を説明します。\n例：窓辺に座っているかわいい猫、日光が当たっている'
      },
      {
        title: '🚫 ネガティブプロンプト',
        content: '画像に含めたくない要素を説明します。\n例：ぼやけた、低品質、歪んだ、醜い\n一般的：blurry, low quality, distorted, ugly'
      },
      {
        title: '✨ プロンプト強化',
        content: 'プロンプトに品質キーワードを自動追加します。\n追加：masterpiece, best quality, highly detailed\n使用時：手動でキーワードを追加せずに高品質を求める場合'
      },
      {
        title: '🎯 推論ステップ',
        content: '画像生成の反復回数。\n推奨：8ステップ（最適なバランス）\nより多く：品質がわずかに向上するが遅い\nより少なく：速いが品質が低下'
      },
      {
        title: '🎨 ガイダンススケール',
        content: 'Turboモデルは0.0を推奨\n高い値：プロンプトに厳密に従う\n低い値：より創造的な自由'
      },
      {
        title: '🔢 バッチサイズ',
        content: '一度に複数の画像を生成（1-4枚）\nそれぞれ異なるランダムシードを使用\n使用時：複数のバリエーションが必要な場合'
      },
      {
        title: '🎲 シード',
        content: '-1：毎回ランダム生成\n固定数：再現可能な結果\n用途：良い画像を見つけた後、同じシードでプロンプトを微調整'
      }
    ],
    modelInfo: {
      title: '📌 モデル情報',
      content: '現在のモデル：Z-Image-Turbo\nタイプ：テキストから画像\n非対応：画像から画像（Z-Image-Editが必要）\n特徴：6Bパラメータ、8ステップ生成、バイリンガルサポート'
    }
  }
}

export default function Help({ lang, onClose }) {
  const content = helpContent[lang]
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ width: '600px', maxHeight: '80vh', background: '#111', border: '1px solid #333', borderRadius: '12px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={24} /> {content.title}
          </h2>
          <button onClick={onClose} style={{ padding: '8px', background: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(80vh - 80px)' }}>
          {content.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: '24px', padding: '16px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #222' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0', color: '#fff' }}>{section.title}</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, color: '#aaa', whiteSpace: 'pre-line' }}>{section.content}</p>
            </div>
          ))}
          <div style={{ padding: '16px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #444' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0', color: '#fff' }}>{content.modelInfo.title}</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, color: '#aaa', whiteSpace: 'pre-line' }}>{content.modelInfo.content}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
