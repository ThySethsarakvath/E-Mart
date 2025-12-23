<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      searchQuery: '',
    }
  }
}
</script>

<template>
  <div class="search-box">
    <input type="text" class="search-input" placeholder="Search for items..." v-model="searchQuery" />
    <button class="search-button">
      <img src="../assets/search.png"/>
    </button>
  </div>
</template>

<style scoped>
  .search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #0990ff;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  max-width: 650px;
  height: 50px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 20px;
  font-size: 14px;
  color: #253d4e;
}

.search-input::placeholder {
  color: #adadad;
}

.search-button {
  background: #0990ff;
  border: none;
  padding: 0 20px;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.3s ease;
}

.search-button:hover {
  background: #0666b4;
}
</style>
