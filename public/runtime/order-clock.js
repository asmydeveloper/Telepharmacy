(function (root) {
  const ORDER_PAYMENT_MS = 15 * 60 * 1000;
  const bangkokTime = new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  function orderDeadline(order, now = Date.now()) {
    if (!order || order.awaitingCheckout) return 0;
    // Older preview orders can lack a persisted deadline.
    if (order.status === 'pending' && !Number.isFinite(order.expiresAt)) {
      order.expiresAt = now + ORDER_PAYMENT_MS;
    }
    return order.expiresAt || 0;
  }

  function secondsUntilPaymentDeadline(deadline, now) {
    return Math.max(0, Math.ceil((deadline - now) / 1000));
  }

  function formatPaymentCountdown(seconds) {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function orderPayable(order, now = Date.now()) {
    return order?.status === 'pending' && (order.awaitingCheckout || orderDeadline(order, now) > now);
  }

  function orderTime(order) {
    return Number.isFinite(order?.expiresAt) ? bangkokTime.format(order.expiresAt) : order?.expires || '';
  }

  function startOrderPayment(order, now = Date.now()) {
    if (order?.status !== 'pending' || !order.awaitingCheckout) return false;
    order.awaitingCheckout = false;
    order.paymentStartedAt = now;
    order.expiresAt = now + ORDER_PAYMENT_MS;
    order.expires = orderTime(order);
    return true;
  }

  function orderRemaining(order, now = Date.now()) {
    if (order?.awaitingCheckout) return 'ยังไม่เริ่มนับ';
    return formatPaymentCountdown(secondsUntilPaymentDeadline(orderDeadline(order, now), now));
  }

  function expirePayment(order, now = Date.now()) {
    if (order?.status !== 'pending' || order.awaitingCheckout || orderPayable(order, now)) return false;
    order.status = 'expired';
    return true;
  }

  root.MitrareeOrderClock = {
    ORDER_PAYMENT_MS,
    orderDeadline,
    secondsUntilPaymentDeadline,
    formatPaymentCountdown,
    orderPayable,
    orderTime,
    startOrderPayment,
    orderRemaining,
    expirePayment,
  };
})(globalThis);
