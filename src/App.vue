<template>
  <div>
    <nav
      style="
        height: 60px;
        width: 100%;
        padding: 0 20px;
        background-color: hsla(160, 100%, 37%, 1);
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        position: fixed;
        top: 0;
        left: 0;
      "
    >
      <p
        v-for="route in routes"
        :key="route.path"
        @click="handleLinkClick(route.path)"
        style="
          height: calc(100% - 10px);
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-right: 20px;
          font-size: 16px;
          font-weight: bold;
          transition: color 0.3s;
          padding: 0 10px;
          font-family: SourceHanSansCN-Regular;
        "
        :style="{
          color: currentPath === route.path ? '#fff' : '#ffffffe0',
          borderBottom: currentPath === route.path ? '3px solid #fff' : 'none',
        }"
      >
        {{ route.name }}
      </p>
    </nav>
    <main class="route" style="">
      <component :is="currentComponent"></component>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect, markRaw } from "vue";
import UsePdf from "./views/UsePdf.vue";
import NotFound from "./views/NotFound.vue";
import Home from "./views/Home.vue";
import UsePdfOnDemand from "./views/UsePdfOnDemand.vue";

const routes = [
  { path: "/", name: "使用iframe加载pdf", component: markRaw(Home) },
  { path: "/usePdf", name: "使用pdfjs-dist", component: markRaw(UsePdf) },
  {
    path: "/onDemandRenderPdf",
    name: "按需渲染pdf",
    component: markRaw(UsePdfOnDemand),
  },
  { path: "/notFound", component: markRaw(NotFound) },
];

const currentPath = ref("/usePdf");
const currentComponent = ref(NotFound);

const getComponentByPath = (path: string) => {
  return routes.find((route) => route.path === path) || { component: NotFound };
};

onMounted(() => {
  currentComponent.value = getComponentByPath(currentPath.value).component;
});

// 监听路由变化
watchEffect(() => {
  currentComponent.value = getComponentByPath(currentPath.value).component;
});

// 你还可以添加一个函数来处理链接点击，例如:
function handleLinkClick(path: string) {
  currentComponent.value = getComponentByPath(path).component;
  currentPath.value = path;
}
</script>

<style lang="css" scoped>
.route {
  width: 1000px;
  margin: 60px auto 0;
  height: calc(
    100vh - 80px
  ); /* Full viewport height minus the height of the nav bar */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #f8f8f8;
  scrollbar-width: thin;
  scrollbar-color: hsla(160, 100%, 37%, 1) #fff;
}

.route::-webkit-scrollbar {
  width: 10px;
  height: 1px;
}

.route::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #535353;
}
.route::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #ededed;
}
</style>
