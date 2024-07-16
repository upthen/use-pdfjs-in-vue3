Here is the English translation of the provided document:

````markdown
<center>

# 🎉 How to Use Pdfjs-dist in Vue3

<img src="./use-pdfjs-in-vue3.gif" alt="use-pdfjs-in-vue3" />

Chinese Documentation | [English Documentation](./README_EN.md)

</center>

## Abstract

This tutorial demonstrates how to use pdfjs-dist to display PDF files in Vue3, providing 3 examples with 3 implementation methods:

- Use iframe to display PDF by leveraging the browser's native capability to load PDF files;
- Render multi-page PDF based on pdfjs-dist;
- Lazily load and render multi-page PDF based on pdfjs-dist.

## Display PDF using iframe

```html
<template>
  <div class="iframe-container">
    <iframe :src="PdfBook" style="width: 100%; height: 100%" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import PdfBook from "@/assets/JavaScript.pdf";
</script>

<style lang="scss" scoped>
  .iframe-container {
    width: calc(100vh - 80px);
    height: 100%;
  }
</style>
```
````

<center>

<img src="./use-iframe-render-pdf.gif" alt="use-iframe-render-pdf" />

</center>

**😊 Pros:**

- Simple to use
- Feature-rich

**😢 Cons:**

- Rendering based on browser's native capability, styles and other aspects are uncontrollable.

## Using pdfjs-dist

### 1. Brute Force Rendering

Directly load and render all PDF pages

```html
<template>
  <div class="pdf-container" ref="pdfContainerRef">
    <canvas
      v-for="pageIndex in pdfPages"
      :id="`pdf-canvas-${pageIndex}`"
      :key="pageIndex"
    />
  </div>
</template>

<script setup lang="ts">
  import * as PDFJS from "pdfjs-dist";
  import * as PdfWorker from "pdfjs-dist/build/pdf.worker.js";
  import { nextTick, onMounted, ref } from "vue";
  import PdfBook from "@/assets/JavaScript.pdf";

  window.pdfjsWorker = PdfWorker;
  let pdfDoc: any = null;
  const pdfPages = ref(0);
  const pdfScale = ref(1.5);
  const pdfContainerRef = ref<HTMLElement | null>(null);

  const loadFile = (url: any) => {
    // 设定pdfjs的 workerSrc 参数
    PDFJS.GlobalWorkerOptions.workerSrc = PdfWorker;
    const loadingTask = PDFJS.getDocument(url);
    loadingTask.promise
      .then(async (pdf: any) => {
        pdf.loadingParams.disableAutoFetch = true;
        pdf.loadingParams.disableStream = true;
        pdfDoc = pdf; // 保存加载的pdf文件流
        pdfPages.value = pdfDoc.numPages; // 获取pdf文件的总页数
        await nextTick(() => {
          renderPage(1); // 将pdf文件内容渲染到canvas
        });
      })
      .catch((error: any) => {
        console.warn(`[upthen] pdfReader loadFile error: ${error}`);
      });
  };

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
        if (num < pdfPages.value) {
          renderPage(num + 1);
        }
      }
    });
  };

  onMounted(() => {
    loadFile(PdfBook);
  });
</script>

<style scoped>
  .pdf-container {
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
```

<center>

<img src="./use-pdfjs-render-multi-pages.gif" alt="use-iframe-render-pdf" />

</center>

**😊 Pros**

- Renders pure PDF pages without additional features.
- Simple to use and fully controllable.

**😢 Cons**

- Poor rendering performance when the PDF file is too large.

**🎉 Suitable for**

- Suitable for displaying small PDF documents with less than 10 pages. It's simple to use, and there's no need to consider too many performance optimization issues.

### 2. On-demand Rendering

Lazy load and render multi-page PDF based on pdfjs-dist

```html
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
    return loadFished.value
      ? pdfPages.value
      : loadedNum.value + preloadNum.value;
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
        containerScrollHeight -
        containerHeight -
        pdfContainerRef.value.scrollTop;
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
```

<center>

<img src="./on-demand-render-multi-pages.gif" alt="use-iframe-render-pdf" />

</center>

**😊 Pros**

- Renders pure PDF pages without additional features.
- Slightly more complex to use, but fully controllable.
- Lazy loading improves rendering performance and provides a better user experience.

**🎉 Suitable for**

- Can be used to display larger PDF files, theoretically, dozens to hundreds of megabytes are not a problem.
- For those who wish to customize some simple features.

## Using pdfjs-dist to Load and Render PDF in Chunks

The previous sections discussed some schemes for rendering PDF files with pdfjs-dist in the project, suitable for rendering PDF files with fewer pages. For larger PDF files, such as those ranging from dozens to hundreds of megabytes, it is not suitable to load all at once but rather in chunks. This approach requires server-side interface cooperation to implement file chunking.

Due to personal time constraints and the level of mastery of backend capabilities, I have not implemented this approach before. Recently, in the project, when using the above schemes, some performance issues occurred when the PDF file was too large, forcing me to consider implementing chunk loading and rendering of PDF.

Thanks to the development of ChatGPT, I conveniently built a backend service based on express and had it help me implement the PDF file chunking interface. So, I can finally implement the content I have always wanted to complete. However, a colleague mentioned that directly using nginx to start a static proxy service to load the PDF, and through nginx configuration, can automatically implement file chunking. This is not expanded here.

### 1. Server-Side Support for Chunk Loading

The following is the backend service code for chunk loading PDF files based on `express` generated by `ChatGPT`.

- Chunk service code

```ts
// server/app.js
const express = require("express");
const app = express();
const port = 3005;
const fs = require("fs");
const path = require("path");
const os = require("os");

const setAllowCrossDomainAccess = (app) => {
  app.all("*", (req, res, next) => {
    const { origin, Origin, referer, Referer } = req.headers;
    const allowOrigin = origin || Origin || referer || Referer || "*" || "null";
    res.header("Access-Control-Allow-Origin", allowOrigin);
    res.header(
      "Access-Control-Allow-Headers",
      "traceparent, Content-Type, Authorization, X-Requested-With"
    );
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Accept-Ranges,Content-Range"
    );
    res.header("X-Powered-By", "Express");
    res.header("Accept-Ranges", 65536 * 4);
    if (req.method == "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });
};

setAllowCrossDomainAccess(app);
const CHUNK_SIZE = 1024 * 1024; // 1MB

app.get("/getPdf", (req, res) => {
  console.log("request received", req.headers);

  const filePath = path.join(__dirname, "../src/assets/JavaScript.pdf");
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "application/octet-stream",
    });

    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Accept-Ranges": "bytes",
      "Content-Type": "application/pdf",
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
});

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }
  return "localhost";
}

function startServer(port) {
  const server = app.listen(port, () => {
    const ipAddress = getLocalIpAddress();
    console.log(`Server running at http://${ipAddress}:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use. Trying the next port...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(port);
```

- Execute the following command to start the service

```bash
pnpm run serve
```

![alt text](server.png)

When calling this service, if it has been properly supported for chunk loading, the network request will probably look like this.

![alt text](http_request.png)

As shown in the figure, there will first be a request with a status code of 200, and the response's Content-Length will return the overall size of the file, which is 1272413 in the figure.
Then, it will return the chunk content of the file, with a status code of 206 Partial Content, Content-Length for the size of each chunk requested by the client, usually 65536. Then the Content-Range returns the range of the current chunk in the entire file.

### 2. Front-end Request Supports Lazy Loading

Here is the implementation of the front-end rendering based on pdfjs-dist, which is based on the <a href="ondemand">on-demand lazy loading</a> section of the code.

The previous implementation was to load all the files before rendering. One key content is the `PDF.getDocument(url)` part.
This part is used to obtain the PDF file resource. When using it, pass the file service address, local file reference, or a file stream converted Unit8Array as the url.

Lazy loading of PDF chunks means that you can no longer use the previous method of passing the full file stream. It is necessary to use the method of passing the file service address, handing over the request file to the internal processing of pdfjs-dist, which is as follows.

```ts
loadingTask = PDFJS.getDocument("http://10.5.67.55:3005");
```

But this way of writing has two problems:

- My file service is not bare, it needs to carry the token, how to set other response headers and parameters, how to do these?
- pdfjs-dist supports lazy loading and needs to set two parameters: disableAutoFetch and disableStream, where should these be configured?

There are no answers to these two questions on the Internet, but I know that pdfjs-dist definitely supports it, because it can be done when using the full pdfjs library, and pdfjs-dist is the core library of pdfjs. With my doubts, I read the source code of this core library and found the specific implementation of the `getDocument()` API.

😜 Let's give the answer first, the source code or something, for those who are interested, you can continue to watch.

By reading the getDocument API, it is found that this method is roughly two steps

- Receive a src parameter;
- Based on src and default parameter configuration, generate a worker;
- Return a promise task based on the worker to handle file loading asynchronously;

The src supports passing an object, which can pass parameters such as `url`, `httpHeader`, `disableAutoFetch`, `disableStream`, `rangeChunkSize`, etc.

Based on the above, our implementation plan is about to come out. A simple transformation of the aforementioned scheme:

```ts
onMounted(async () => {
  .....
  // getDocument here can pass not only a url but also an object. If the request needs to carry a header, it can be passed like this
  loadingTask = PDFJS.getDocument({
    url: "http://10.5.67.55:3005/getPdf",
    httpHeaders: { Authorization: "Bearer 123" },
    // The following two configurations need to be explicitly set to true
    disableAutoFetch: true,
    disableStream: true,
  });
  .....
});
```

It should be noted that when enabling `disableAutoFetch`, `disableStream` should also be enabled at the same time. These two properties are `false` by default and need to be configured to be enabled.

Interested students, you can take a look at this source code implementation together, this API implementation is relatively long, you can read it roughly first, and then focus on the content we are concerned about.

```ts
// build/pdf.js
function getDocument(src) {
  var task = new PDFDocumentLoadingTask(); // 一个文档加载的实例，是个 promise，意味着可以异步去加载文件
  var source;
  // 这里可以看到，getDocument 支持的参数有 4 种类型，之前一直以为只有 1 种😂
  if (typeof src === "string" || src instanceof URL) {
    source = {
      url: src,
    };
  } else if ((0, _util.isArrayBuffer)(src)) {
    source = {
      data: src,
    };
  } else if (src instanceof PDFDataRangeTransport) {
    source = {
      range: src,
    };
  } else {
    if (_typeof(src) !== "object") {
      throw new Error(
        "Invalid parameter in getDocument, " +
          "need either string, URL, Uint8Array, or parameter object."
      );
    }

    if (!src.url && !src.data && !src.range) {
      throw new Error(
        "Invalid parameter object: need either .data, .range or .url"
      );
    }

    source = src;
  }

  var params = Object.create(null);
  var rangeTransport = null,
    worker = null;

  // 一个for循环设置一些参数
  for (var key in source) {
    var value = source[key];

    switch (key) {
      case "url":
        if (typeof window !== "undefined") {
          try {
            params[key] = new URL(value, window.location).href;
            continue;
          } catch (ex) {
            (0, _util.warn)('Cannot create valid URL: "'.concat(ex, '".'));
          }
        } else if (typeof value === "string" || value instanceof URL) {
          params[key] = value.toString();
          continue;
        }

        throw new Error(
          "Invalid PDF url data: " +
            "either string or URL-object is expected in the url property."
        );

      case "range":
        rangeTransport = value;
        continue;

      case "worker":
        worker = value;
        continue;

      case "data":
        if (
          _is_node.isNodeJS &&
          typeof Buffer !== "undefined" &&
          value instanceof Buffer
        ) {
          params[key] = new Uint8Array(value);
        } else if (value instanceof Uint8Array) {
          break;
        } else if (typeof value === "string") {
          params[key] = (0, _util.stringToBytes)(value);
        } else if (
          _typeof(value) === "object" &&
          value !== null &&
          !isNaN(value.length)
        ) {
          params[key] = new Uint8Array(value);
        } else if ((0, _util.isArrayBuffer)(value)) {
          params[key] = new Uint8Array(value);
        } else {
          throw new Error(
            "Invalid PDF binary data: either typed array, " +
              "string, or array-like object is expected in the data property."
          );
        }

        continue;
    }

    params[key] = value;
  }

  // 可以看到这里有超多自定义参数，理论上都是可以通过 getDocument api 传参实现的
  params.rangeChunkSize = params.rangeChunkSize || DEFAULT_RANGE_CHUNK_SIZE;
  params.CMapReaderFactory =
    params.CMapReaderFactory || DefaultCMapReaderFactory;
  params.ignoreErrors = params.stopAtErrors !== true;
  params.fontExtraProperties = params.fontExtraProperties === true;
  params.pdfBug = params.pdfBug === true;
  params.enableXfa = params.enableXfa === true;

  if (
    typeof params.docBaseUrl !== "string" ||
    (0, _display_utils.isDataScheme)(params.docBaseUrl)
  ) {
    params.docBaseUrl = null;
  }

  if (!Number.isInteger(params.maxImageSize)) {
    params.maxImageSize = -1;
  }

  if (typeof params.isEvalSupported !== "boolean") {
    params.isEvalSupported = true;
  }

  if (typeof params.disableFontFace !== "boolean") {
    params.disableFontFace =
      _api_compatibility.apiCompatibilityParams.disableFontFace || false;
  }

  if (typeof params.ownerDocument === "undefined") {
    params.ownerDocument = globalThis.document;
  }

  if (typeof params.disableRange !== "boolean") {
    params.disableRange = false;
  }

  // 禁止流式加载
  if (typeof params.disableStream !== "boolean") {
    params.disableStream = false;
  }
  // 禁止自动加载
  if (typeof params.disableAutoFetch !== "boolean") {
    params.disableAutoFetch = false;
  }

  (0, _util.setVerbosityLevel)(params.verbosity);

  if (!worker) {
    var workerParams = {
      verbosity: params.verbosity,
      port: _worker_options.GlobalWorkerOptions.workerPort,
    };
    worker = workerParams.port
      ? PDFWorker.fromPort(workerParams)
      : new PDFWorker(workerParams);
    task._worker = worker;
  }

  var docId = task.docId;
  worker.promise
    .then(function () {
      if (task.destroyed) {
        throw new Error("Loading aborted");
      }

      var workerIdPromise = _fetchDocument(
        worker,
        params,
        rangeTransport,
        docId
      );

      var networkStreamPromise = new Promise(function (resolve) {
        var networkStream;

        if (rangeTransport) {
          networkStream = new _transport_stream.PDFDataTransportStream(
            {
              length: params.length,
              initialData: params.initialData,
              progressiveDone: params.progressiveDone,
              contentDispositionFilename: params.contentDispositionFilename,
              disableRange: params.disableRange,
              disableStream: params.disableStream,
            },
            rangeTransport
          );
        } else if (!params.data) {
          // 如何设置响应头，这里找到答案了
          // 果然提供了 httpHeaders 参数供用户定制
          networkStream = createPDFNetworkStream({
            url: params.url,
            length: params.length,
            httpHeaders: params.httpHeaders,
            withCredentials: params.withCredentials,
            rangeChunkSize: params.rangeChunkSize,
            disableRange: params.disableRange,
            disableStream: params.disableStream,
          });
        }

        resolve(networkStream);
      });
      return Promise.all([workerIdPromise, networkStreamPromise]).then(
        function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            workerId = _ref2[0],
            networkStream = _ref2[1];

          if (task.destroyed) {
            throw new Error("Loading aborted");
          }

          var messageHandler = new _message_handler.MessageHandler(
            docId,
            workerId,
            worker.port
          );
          messageHandler.postMessageTransfers = worker.postMessageTransfers;
          var transport = new WorkerTransport(
            messageHandler,
            task,
            networkStream,
            params
          );
          task._transport = transport;
          messageHandler.send("Ready", null);
        }
      );
    })
    ["catch"](task._capability.reject);
  return task;
}
```

Based on the above source code, it is easy to get our solution. The above, the scheme for chunk loading PDF is
completed.

### 3. Effect Demonstration

<img src="./disable-auto-fetch.gif" alt="disable-auto-fetch-pdf" />

## Performance Comparison

### 1. Performance Comparison

The following is a performance comparison of the above schemes.

Test document: 112 pages, development environment test, local one-time file loading, without considering other performance optimization methods.

- No lazy loading

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/934207754a2f4eceb20b24e852188322~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=331&h=141&s=6936&e=png&b=fffdfd)

- Lazy loading

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8dc927fa4281427b8aaf44ef8b618675~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=326&h=150&s=7276&e=png&b=fefdfd)

✨ The above two are rendered after requesting all the file streams at once.

- Chunk loading files from the server, chunk size set to 1024 bytes

![alt text](performance_disable_auto_fetch.png)

### 2. Conclusion

- Ultra-small files (about 10 pages): No need to consider lazy loading
- Small to medium-sized files (5 - 20M): Need to consider lazy loading, no need for chunking
- Large files (20 - several hundred megabytes): Chunking is definitely needed, and other performance optimization methods should be considered, such as dynamically removing some invisible pages when there are too many pages to avoid page stuttering.

## Postscript

There are many more features related to PDFs, and here only some commonly used methods are listed. More related tutorials will be unlocked in the future if there is time.

## Related Blogs

[How to Use Pdfjs in Vue3 to Display PDF Documents](https://juejin.cn/post/7277475232320536633#heading-18)

## References

- [pdf.js Source Code](https://github.com/mozilla/pdf.js)
- [pdf.js Official Documentation](https://mozilla.github.io/pdf.js/)

## License

This project is licensed under the MIT License.
