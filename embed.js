/**
 * Español con Sabor - Embeddable Booking Web Component
 * Usage:
 *   <script src="https://espanolconsaboracademy.com/embed.js" defer></script>
 *   <sabor-booking-widget slug="clase-individual-60min"></sabor-booking-widget>
 */

(function () {
  class SaborBookingWidget extends HTMLElement {
    connectedCallback() {
      const slug = this.getAttribute('slug') || 'clase-individual-60min';
      const baseUrl = this.getAttribute('host') || 'https://espanolconsaboracademy.com';
      const height = this.getAttribute('height') || '850px';

      this.innerHTML = `
        <div style="width:100%; max-width: 900px; margin: 0 auto; box-shadow: 0 10px 30px rgba(14, 90, 96, 0.08); border-radius: 24px; overflow: hidden; background: #ffffff;">
          <iframe 
            src="${baseUrl}/reservar?link=${encodeURIComponent(slug)}&embed=true"
            style="width: 100%; height: ${height}; border: none; display: block;"
            loading="lazy"
            allow="camera; microphone; payment"
          ></iframe>
        </div>
      `;
    }
  }

  if (!customElements.get('sabor-booking-widget')) {
    customElements.define('sabor-booking-widget', SaborBookingWidget);
  }
})();
