

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
  <div class="page-container space-y-4 md:space-y-8">
    <!-- Tool Categories -->
    <section 
      v-for="category in visibleCategories" 
      :key="category.label"
      class="space-y-3 md:space-y-4"
    >
      <!-- Category Header -->
      <header class="heading-group">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <component 
              :is="category.icon" 
              class="w-4 h-4 md:w-5 md:h-5 text-primary"
            />
          </div>
          <div>
            <h2>{{ category.label }}</h2>
            <p class="hidden md:block mt-1">{{ category.description }}</p>
          </div>
        </div>
      </header>

      <!-- Tools Grid -->
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
        <Card 
          v-for="tool in category.subRoutes"
          :key="tool.label"
          class="group relative overflow-hidden border-0 bg-card/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ring-1 ring-border/50 hover:ring-primary/20 h-full"
          @click="$router.push(tool.route)"
        >
          <CardContent class="p-3 md:p-4 text-center relative h-full flex flex-col">
            <!-- Background Gradient -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <!-- Icon Container -->
            <div class="relative z-10 mb-2 md:mb-3">
              <div class="w-10 h-10 md:w-12 md:h-12 mx-auto rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors duration-300 relative">
                <component 
                  :is="tool.icon" 
                  class="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:scale-110 transition-transform duration-300"
                />
                
                <!-- Status Badge -->
                <Badge 
                  v-if="tool.status"
                  :variant="getStatusBadgeVariant(tool.status)"
                  class="absolute -top-1 -right-1 text-xs h-4 px-1.5 font-medium border-2 border-background shadow-sm"
                >
                  {{ tool.status }}
                </Badge>
              </div>
            </div>

            <!-- Tool Info -->
            <div class="heading-group space-y-0.5 md:space-y-1 relative z-10 flex-1 flex flex-col justify-center">
              <h3 class="font-medium text-sm md:text-base leading-tight group-hover:text-primary transition-colors duration-300">
                {{ tool.label }}
              </h3>
              <p 
                v-if="tool.description" 
                class="text-xs text-muted-foreground line-clamp-2 leading-tight hidden md:block group-hover:text-foreground/80 transition-colors duration-300"
              >
                {{ tool.description }}
              </p>
            </div>

            <!-- Hover Indicator - Now positioned relative to the card, not content -->
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>

