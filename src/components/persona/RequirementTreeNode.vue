<template>
  <div class="requirement-tree-node">
    <div 
      class="requirement-item" 
      :class="{ 'has-children': hasChildren, 'is-expanded': isExpanded }"
      :style="{ paddingLeft: `${level * 20 + 12}px` }"
    >
      <!-- 展开/收起按钮 -->
      <button 
        v-if="hasChildren"
        class="tree-toggle-btn"
        @click.stop="$emit('toggle', personaId, requirement.requirementId)"
      >
        <svg 
          class="tree-toggle-icon" 
          :class="{ 'rotated': isExpanded }"
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span v-else class="tree-toggle-spacer"></span>
      
      <!-- 需求内容 -->
      <div class="requirement-content" @click.stop="$emit('click', personaId, requirement.requirementId)">
        <div class="requirement-header">
          <h4 class="requirement-title">{{ requirement.title || t('persona.requirementManagement.noTitle') }}</h4>
          <button 
            class="requirement-delete-btn" 
            @click.stop="$emit('delete', personaId, requirement.requirementId)" 
            :title="t('persona.list.delete')"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="requirement-info">
          <span v-if="requirement.priority" class="requirement-priority">
            {{ getPriorityLabel(requirement.priority) }}
          </span>
          <span v-if="requirement.explicitRequirement" class="requirement-explicit">
            {{ requirement.explicitRequirement }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- 子需求（递归渲染） -->
    <div v-if="hasChildren && isExpanded" class="requirement-children">
      <RequirementTreeNode
        v-for="child in requirement.children"
        :key="child.requirementId"
        :requirement="child"
        :persona-id="personaId"
        :level="level + 1"
        :expanded-items="expandedItems"
        :get-priority-label="getPriorityLabel"
        @toggle="$emit('toggle', $event[0], $event[1])"
        @click="$emit('click', $event[0], $event[1])"
        @delete="$emit('delete', $event[0], $event[1])"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  requirement: {
    type: Object,
    required: true
  },
  personaId: {
    type: [Number, String],
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  expandedItems: {
    type: Object,
    default: () => ({})
  },
  getPriorityLabel: {
    type: Function,
    required: true
  }
})

defineEmits(['toggle', 'click', 'delete'])

const hasChildren = computed(() => {
  return props.requirement.children && props.requirement.children.length > 0
})

const isExpanded = computed(() => {
  return !!props.expandedItems[props.requirement.requirementId]
})
</script>

<style scoped>
.requirement-tree-node {
  margin-bottom: 4px;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 152, 0, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.requirement-item:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 152, 0, 0.4);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
}

.tree-toggle-btn {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 152, 0, 0.8);
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
  margin-top: 2px;
}

.tree-toggle-btn:hover {
  color: #ff9800;
  transform: scale(1.1);
}

.tree-toggle-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.tree-toggle-icon.rotated {
  transform: rotate(90deg);
}

.tree-toggle-spacer {
  width: 20px;
  flex-shrink: 0;
}

.requirement-content {
  flex: 1;
  min-width: 0;
}

.requirement-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.requirement-title {
  font-size: 14px;
  font-weight: 600;
  color: #ff9800;
  margin: 0;
  text-shadow: 0 0 8px rgba(255, 152, 0, 0.5);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.requirement-delete-btn {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%);
  color: #f44336;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  padding: 0;
}

.requirement-delete-btn:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.25) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  transform: scale(1.1) rotate(90deg);
}

.requirement-delete-btn svg {
  width: 12px;
  height: 12px;
}

.requirement-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.requirement-priority {
  color: rgba(255, 152, 0, 0.8);
  font-weight: 500;
}

.requirement-explicit {
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.requirement-children {
  margin-left: 20px;
  margin-top: 4px;
  border-left: 2px solid rgba(255, 152, 0, 0.2);
  padding-left: 12px;
}

/* 层级样式 */
.requirement-item[style*="padding-left: 12px"] {
  border-left: 3px solid rgba(255, 152, 0, 0.4);
}

.requirement-item[style*="padding-left: 32px"] {
  border-left: 3px solid rgba(255, 152, 0, 0.3);
}

.requirement-item[style*="padding-left: 52px"] {
  border-left: 3px solid rgba(255, 152, 0, 0.2);
}
</style>

