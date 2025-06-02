

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  getFilteredNavigationSections, 
  isChromeExtension, 
  getIconSvg,
  type NavigationSection, 
  type NavigationItem 
} from '@/data/navigation'

// Get filtered navigation data
const toolCategories = computed(() => getFilteredNavigationSections(isChromeExtension()))

// Convert navigation data to match template structure
const visibleCategories = computed(() => {
  return toolCategories.value.map(category => ({
    ...category,
    subRoutes: category.items.map(item => ({
      label: item.label,
      description: item.description,
      icon: item.icon,
      route: item.path,
      isWeb: !item.chromeExtensionOnly,
      status: item.status
    }))
  }))
})


const getStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case 'soon': return 'secondary'
    case 'beta': return 'outline'
    case 'new': return 'default'
    default: return undefined
  }
}


</script>
<template>
  <div class="page-container space-y-3 md:space-y-6">

    <!-- Tool Categories -->
    <div 
      v-for="category in visibleCategories" 
      :key="category.label"
      class="space-y-2 md:space-y-3"
    >
      <!-- Category Header -->
      <div class="heading-group">
        <h2>{{ category.label }}</h2>
        <p class="hidden md:block">{{ category.description }}</p>
      </div>

      <!-- Tools Grid -->
      <div class="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
        <Card 
          v-for="tool in category.subRoutes"
          :key="tool.label"
          class="group relative hover:shadow-md transition-all duration-200 cursor-pointer"
          @click="$router.push(tool.route)"
        >
          <CardContent class="p-2 md:p-4 text-center space-y-1 md:space-y-2">
            <!-- Icon -->
            <div class="relative">
              <component 
                :is="tool.icon" 
                class="w-6 h-6 md:w-8 md:h-8 mx-auto text-primary"
              />
              <!-- Status Badge -->
              <Badge 
                v-if="tool.status"
                :variant="getStatusBadgeVariant(tool.status)"
                class="absolute -top-1 -right-1 text-xs h-3 md:h-4 px-1 hidden md:flex"
              >
                {{ tool.status }}
              </Badge>
            </div>

            <!-- Tool Info -->
            <div class="heading-group space-y-0 md:space-y-1">
              <h3>{{ tool.label }}</h3>
              <p 
                v-if="tool.description" 
                class="line-clamp-2 hidden md:block"
              >
                {{ tool.description }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

