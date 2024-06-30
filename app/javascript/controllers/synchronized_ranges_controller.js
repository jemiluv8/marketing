import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="synchronized-ranges"
export default class extends Controller {
  static targets = ["slider"];

  static locked = false;

  connect() {
    this.updateSliders();
  }

  updateSliders() {
    const total = this.sliderTargets.reduce((sum, slider) => sum + parseInt(slider.value), 0);
    if (total !== 100) {
      const diff = 100 - total;
      const firstSlider = this.sliderTargets[0];
      firstSlider.value = parseInt(firstSlider.value) + diff;
      firstSlider.dispatchEvent(new Event("input"));
    }
  }

  syncSliders(event) {
    if (this.locked) { return }

    this.locked = true
    const updatedSlider = event.target;
    const total = this.sliderTargets.reduce((sum, slider) => sum + parseInt(slider.value), 0);
    if (total > 100) {
      const excess = total - 100;
      this.adjustSliders(updatedSlider, -excess);
    } else if (total < 100) {
      const deficit = 100 - total;
      this.adjustSliders(updatedSlider, deficit);
    }
    this.locked = false
  }

  adjustSlider(slider, share) {
    slider.value = Math.max(0, Math.min(100, parseInt(slider.value) + share));
    slider.dispatchEvent(new Event("input"));

    const changeEvent = new Event("input-sync")
    slider.dispatchEvent(changeEvent)
  }

  adjustSliders(excludeSlider, adjustment) {
    const otherSliders = this.sliderTargets.filter(slider => slider !== excludeSlider && !slider.disabled);

    if (Math.abs(adjustment) === 1) {
        this.adjustSlider(otherSliders[0], adjustment)
        return
    }
    const share = adjustment / otherSliders.length;
    otherSliders.forEach(slider => this.adjustSlider(slider, share));

    // This will kick in when the total exceeds and the locked/disabled slider will be ignored
    this.updateSliders()
  }
}
