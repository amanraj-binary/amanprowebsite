// पेमेंट शुरू करने का एलीट फंक्शन
export const initiateSubscription = (userProfile, onSuccess) => {
  const options = {
    key: "rzp_test_SNZwxjaGbqCd6w", // आपकी असली चाबी
    amount: 9900, // ₹99
    currency: "INR",
    name: "AMAN_PRO AI_LAB",
    description: "Activate PRO Access (500 Duels/Day)",
    handler: function (response) {
      // अगर पेमेंट सफल हुआ, तो ये 'onSuccess' को पेमेंट ID भेज देगा
      onSuccess(response.razorpay_payment_id);
    },
    prefill: {
      name: userProfile?.username || "Aman User",
      email: userProfile?.email || ""
    },
    theme: { color: "#00f2ff" }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
