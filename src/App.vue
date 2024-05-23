
<template>
  <div>
    <nav style="
      height: 60px;
      width: 100%;
      padding: 0 20px;
      background-color: #333;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex; 
      align-items: center; 
      justify-content: flex-start; 
      position: fixed; 
      top: 0; 
      left: 0;
    ">
      <p v-for="route in routes" 
         :key="route.path" 
         @click="handleLinkClick(route.path)" 
         style="
           cursor: pointer; 
           margin-right: 20px;
           font-size: 16px;
           font-weight: bold;
           transition: color 0.3s;
         "
         :style="{ color: currentPath.value === route.path ? '#4CAF50' : 'inherit' }"
         >
        {{ route.name }}
      </p>
    </nav>
    <main class="route" style="
      
    ">
       <component :is="currentComponent"></component>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect, markRaw  } from 'vue'
import UsePdf from './views/UsePdf.vue'
import NotFound from './views/NotFound.vue';
import Home from './views/Home.vue';

const routes = [
  { path: '/', name: '主页',component: markRaw(Home) },
  { path: '/usePdf', name: '使用pdf', component: markRaw(UsePdf) },
  { path: '/ondemandRenderPdf', name: '按需渲染pdf', component: markRaw(UsePdf) },
  { path: '/notFound', component: markRaw(NotFound) },
];

const currentPath = ref('/usePdf');
const currentComponent = ref(NotFound);

const getComponentByPath = (path: string) => {
  return routes.find(route => route.path === path) || { component: NotFound };
}

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
}

</script>

<style lang="css" scoped >

.route {
  width: 1000px; 
  margin: 60px auto 0; 
  overflow-y: auto;
  min-height: calc(100vh - 60px); /* Full viewport height minus the height of the nav bar */
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  background-color: #f8f8f8;
  scrollbar-width: thin;
  scrollbar-color: #4CAF50 #f8f8f8;
}
 /* For Webkit browsers */
.route::-webkit-scrollbar {
  width: 8px;
}
.route::-webkit-scrollbar-track {
  background: #f8f8f8;
}
.route::-webkit-scrollbar-thumb {
  background-color: #4CAF50;
  border-radius: 10px;
  border: 2px solid #f8f8f8;
}
</style>
