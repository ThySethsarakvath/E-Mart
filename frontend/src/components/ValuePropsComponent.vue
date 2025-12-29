<template>
  <div class="value-props-container">
    <div class="value-props-content">

      <div class="value-prop">
        <div class="icon-outer-circle">
          <img src="../assets/delivery.png" alt="Free Delivery" class="prop-icon" />
        </div>
        <h3 class="prop-title">FREE AND FAST DELIVERY</h3>
        <p class="prop-description">Free delivery for all orders over $25</p>
      </div>

      <div class="value-prop">
        <div class="icon-outer-circle">
          <img src="../assets/thumb.jpg" alt="Best Price" class="prop-icon" />
        </div>
        <h3 class="prop-title">BEST PRICE IN TOWN</h3>
        <p class="prop-description">Best value for your money in Phnom Penh</p>
      </div>

      <div class="value-prop">
        <div class="icon-outer-circle">
          <img src="../assets/khmer.jpg" alt="Khmer Business" class="prop-icon" />
        </div>
        <h3 class="prop-title">KHMER LOCAL BUSINESS</h3>
        <p class="prop-description">Shop with confidence and peace of mind</p>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ValuePropsComponent'
}
</script>

<style scoped>
.value-props-container {
  width: 100%;
  padding: 40px 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 90px;
  border-radius: 20px;
}

.value-props-content {
  display: flex;
  width: 100%;
  max-width: 1100px;
  justify-content: space-around;
  align-items: flex-start;
  gap: 20px;
}

.value-prop {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-outer-circle {
  width: 80px;
  height: 80px;
  background-color: #0d6efd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.prop-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: contain;
}

.prop-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 10px 0;
  letter-spacing: 0.5px;
}

.prop-description {
  font-size: 14px;
  margin: 0;
  max-width: 250px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .value-props-content {
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }
}
</style>
