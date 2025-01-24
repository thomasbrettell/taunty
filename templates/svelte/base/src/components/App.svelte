<script <% if (isTS) { %>lang="ts"<% } %>>
  let count = $state(0);
</script>

<button onclick={() => count++}>{count}</button>

<style lang="scss">
  button {
    background-color: red;
  }
</style>
