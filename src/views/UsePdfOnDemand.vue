<template>
  <div class="ondemand-pdf-container" ref="pdfContainerRef">
    <canvas v-for="pageIndex in pdfPages" :id="`pdf-canvas-${pageIndex}`"  :key="pageIndex" />
  </div>
</template>

<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import * as PdfWorker from 'pdfjs-dist/build/pdf.worker.js'
import { nextTick, onMounted, ref } from 'vue'
import PdfBook from '@/assets/JavaScrip.pdf'

window.pdfjsWorker = PdfWorker
let pdfDoc:any = null
const pdfPages = ref(0)
const pdfScale = ref(1.5)
const pdfContainerRef = ref<HTMLElement | null>(null)

PDFJS.GlobalWorkerOptions.workerSrc = PdfWorker
let loadingTask

const loadFile = (url:any) => {
  // 设定pdfjs的 workerSrc 参数
  PDFJS.GlobalWorkerOptions.workerSrc = PdfWorker
  const loadingTask = PDFJS.getDocument(url)
  loadingTask.promise.then(async (pdf:any) => {
    pdf.loadingParams.disableAutoFetch = true
    pdf.loadingParams.disableStream = true
    pdfDoc = pdf // 保存加载的pdf文件流
    pdfPages.value = pdfDoc.numPages // 获取pdf文件的总页数
    await nextTick(() => {
      renderPage(1) // 将pdf文件内容渲染到canvas
    })
  }).catch((error:any) => {
    console.warn(`[upthen] pdfReader loadFile error: ${error}`)
  })
}



const renderPage = (num:any) => {
  pdfDoc.getPage(num).then((page:any) => {
    page.cleanup()
    if (pdfContainerRef.value) {
      pdfScale.value = pdfContainerRef.value.clientWidth / page.view[2]
    }
    const canvas:any = document.getElementById(`pdf-canvas-${num}`)
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      const bsr = ctx.webkitBackingStorePixelRatio ||
                  ctx.mozBackingStorePixelRatio ||
                  ctx.msBackingStorePixelRatio ||
                  ctx.oBackingStorePixelRatio ||
                  ctx.backingStorePixelRatio ||
                  1
      const ratio = dpr / bsr
      const viewport = page.getViewport({ scale: pdfScale.value })
      canvas.width = viewport.width * ratio
      canvas.height = viewport.height * ratio
      canvas.style.width = viewport.width + 'px'
      canvas.style.height = viewport.height + 'px'
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      }
      page.render(renderContext)
      // if (num < pdfPages.value) {
      //   renderPage(num + 1)
      // }
    }
  })
}

const initPdfLoader = (loadingTask: any) => {
  return new Promise((resolve, reject) => {
    loadingTask.promise.then((pdf: any) => {
      pdf.loadingParams.disableAutoFetch = true
      pdf.loadingParams.disableStream = true
      pdfDoc = pdf // 保存加载的pdf文件流
      pdfPages.value = pdfDoc.numPages // 获取pdf文件的总页数
      resolve(true)
    }).catch((error:any) => {
      reject(error)
      console.warn(`[upthen] pdfReader loadFile error: ${error}`)
    })
  })
}

onMounted(async () => {
  // loadFile(PdfBook)
  // 设定pdfjs的 workerSrc 参数
  
  loadingTask = PDFJS.getDocument(PdfBook)

  if (await initPdfLoader(loadingTask)) {
    renderPage(1)
  }

})
</script>

<style lang="scss" scoped>
.ondemand-pdf-container  {
  canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
