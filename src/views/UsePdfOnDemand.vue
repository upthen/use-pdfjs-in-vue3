<template>
  <div class="on-demand-pdf-container" ref="pdfContainerRef">
    <canvas
      v-for="pageIndex in renderedPages"
      :id="`pdf-canvas-${pageIndex}`"
      :key="pageIndex"
    />
  </div>
</template>

<script setup lang="ts">
// import * as PDFJS from "pdfjs-dist";
// import * as PdfWorker from "pdfjs-dist/build/pdf.worker.js";
import { nextTick, onMounted, ref, computed, onUnmounted } from "vue";
import PdfBook from "@/assets/JavaScript.pdf";

let pdfDoc: any = null;
const pdfPages = ref(0);
const pdfScale = ref(1.5);
const pdfContainerRef = ref<HTMLElement | null>(null);
const loadedNum = ref(0);
const preloadNum = computed(() => {
  return pdfPages.value - loadedNum.value > 3
    ? 3
    : pdfPages.value - loadedNum.value;
});
const loadFished = computed(() => {
  const loadFinished = loadedNum.value + preloadNum.value >= pdfPages.value;
  if (loadFinished) {
    removeEventListeners();
  }
  return loadFinished;
});

const renderedPages = computed(() => {
  return loadFished.value ? pdfPages.value : loadedNum.value + preloadNum.value;
});

let loadingTask;
const renderPage = (num: any) => {
  pdfDoc.getPage(num).then((page: any) => {
    page.cleanup();
    if (pdfContainerRef.value) {
      pdfScale.value = pdfContainerRef.value.clientWidth / page.view[2];
    }
    const canvas: any = document.getElementById(`pdf-canvas-${num}`);
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;
      const ratio = dpr / bsr;
      const viewport = page.getViewport({ scale: pdfScale.value });
      canvas.width = viewport.width * ratio;
      canvas.height = viewport.height * ratio;
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      page.render(renderContext);
      if (num < loadedNum.value + preloadNum.value && !loadFished.value) {
        renderPage(num + 1);
      } else {
        loadedNum.value = loadedNum.value + preloadNum.value;
      }
    }
  });
};

const initPdfLoader = async (loadingTask: any) => {
  return new Promise((resolve, reject) => {
    loadingTask.promise
      .then((pdf: any) => {
        pdf.loadingParams.disableAutoFetch = true;
        pdf.loadingParams.disableStream = true;
        pdfDoc = pdf; // 保存加载的pdf文件流
        pdfPages.value = pdfDoc.numPages; // 获取pdf文件的总页数
        resolve(true);
      })
      .catch((error: any) => {
        reject(error);
        console.warn(`[upthen] pdfReader loadFile error: ${error}`);
      });
  });
};

const distanceToBottom = ref(0);
const calculateDistanceToBottom = () => {
  if (pdfContainerRef.value) {
    const containerHeight = pdfContainerRef.value.offsetHeight;
    const containerScrollHeight = pdfContainerRef.value.scrollHeight;
    distanceToBottom.value =
      containerScrollHeight - containerHeight - pdfContainerRef.value.scrollTop;
    console.log(distanceToBottom.value);
  }
};

const lazyRenderPdf = () => {
  calculateDistanceToBottom();
  if (distanceToBottom.value < 1000) {
    renderPage(loadedNum.value);
  }
};

const removeEventListeners = () => {
  pdfContainerRef.value?.removeEventListener("scroll", () => {
    lazyRenderPdf();
  });
};

onMounted(async () => {
  // 设定pdfjs的 workerSrc 参数
  let PDFJS = await import("pdfjs-dist");
  window.pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.js");
  PDFJS.GlobalWorkerOptions.workerSrc = window.pdfjsWorker;
  loadingTask = PDFJS.getDocument(PdfBook);
  if (await initPdfLoader(loadingTask)) {
    renderPage(1);
  }

  pdfContainerRef.value.addEventListener("scroll", () => {
    lazyRenderPdf();
  });
});

onUnmounted(() => {
  removeEventListeners();
});
</script>

<style lang="scss" scoped>
.on-demand-pdf-container {
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
