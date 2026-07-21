'use strict';
const elements = {
  overlay: document.querySelector('.overlay'),
  dialog: document.querySelector('.dialog'),
  popupAction: document.querySelector('.popup'),
  btnClosePopup: document.querySelector('.success-close-btn'),
  confirmPopup: document.querySelector('.popup-confirm'),
  containerPopupAction: document.querySelector('.popup-ations'),
  btnNo: document.querySelector('.btn-confirm-no'),
  btnYes: document.querySelector('.btn-confirm-yes'),
  ContainerBtns: document.querySelector('.container-btns'),
  finshDrawBtn: document.querySelector('.finsh-draw'),
  overlayMap: document.querySelector('.overlay-map'),
  closeBtnDialog: document.getElementById('closeModalBtn'),
  cancelBtnDialog: document.getElementById('cancelModalBtn'),
  dynamicFieldContainer: document.getElementById('dynamicFieldContainer'),
  btnFitBounds: document.querySelector('.btn-fit-bounds'),
  formEdit: document.getElementById('editForm'),
  formNew: document.querySelector('.form-new'),
  containerWorkouts: document.querySelector('.workouts'),
  sortBtn: document.querySelector('.sort-btn'),
  sortBy: document.querySelector('.sort-by'),
  inputType: document.querySelector('.form-input-type'),
  inputDistance: document.querySelector('.form-input-distance'),
  inputDuration: document.querySelector('.form-input-duration'),
  inputCadence: document.querySelector('.form-input-cadence'),
  inputElevation: document.querySelector('.form-input-elevation'),
  goToMyPosition: document.querySelector('.go-to-my-position'),
  resetAllBtn: document.querySelector('.btn-reset-all'),
  submitBtn: document.querySelector('.submit-btn'),
};
class Workout {
  date;
  id;
  weatherContent;
  contentWorkoutTitle;
  weatherImo;
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  constructor(data) {
    this.pathCoords = data.pathCoords;
    this.distance = +data.distance;
    this.duration = +data.duration;
    this.id = data.id ? data.id : +(Date.now() + '').slice(-10);
    this.date = data.date ? new Date(data.date) : new Date();
    this.contentWorkoutTitle = data.contentWorkoutTitle || null;
    this.weatherContent = data.weatherContent || null;
    this.weatherImo = data.weatherImo || null;
  }
  async #getGeoAndWeather() {
    const weatherIcons = {
      0: '☀️',
      1: '🌤️',
      2: '⛅',
      3: '☁️',
      45: '🌫️',
      48: '🌫️',
      51: '🌦️',
      53: '🌦️',
      55: '🌧️',
      56: '🌧️',
      57: '🌧️',
      61: '💧',
      63: '🌧️',
      65: '🌧️',
      66: '🥶',
      67: '🥶',
      71: '🌩️',
      73: '❄️',
      75: '❄️',
      77: '❄️',
      80: '🌦️',
      81: '🌧️',
      82: '⛈️',
      85: '🌨️',
      86: '🌨️',
      95: '🌩️',
      96: '⛈️',
      99: '⛈️',
    };
    const [lat, lng] = this.pathCoords[0];
    const [resGeo, resWeather] = await Promise.all([
      fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      ),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`),
    ]);
    if (!resGeo.ok || !resWeather.ok) throw new Error('Problem getting location or weather data');
    const [dataGeo, dataWeather] = await Promise.all([resGeo.json(), resWeather.json()]);
    if (!dataGeo.countryName) {
      throw new Error('❌ Cannot create a workout outside of land! Please select a valid location');
    }
    const weatherTemp = dataWeather.current_weather.temperature;
    const weatherUnit = dataWeather.current_weather_units.temperature;
    const weatherImo = weatherIcons[dataWeather.current_weather.weathercode] || '🌡️';
    const currentTemp = `${weatherTemp}${weatherUnit}`;
    const locality = dataGeo.locality || dataGeo.city || dataGeo.principalSubdivision;
    return {
      country: dataGeo.countryName,
      locality,
      currentTemp,
      weatherImo,
    };
  }
  async contentWorkout() {
    if (this.contentWorkoutTitle && this.weatherContent && this.weatherImo) return;
    const data = await this.#getGeoAndWeather();
    const currMonth = this.months[this.date.getMonth()];
    const currDay = this.date.getDate();
    const iconType = this.type === 'Running' ? '🏃‍♂️' : '🚴‍♀️';
    this.weatherContent = data.currentTemp;
    this.contentWorkoutTitle = `${iconType} ${this.type} on ${currMonth} ${currDay} in ${data.country} : ${data.locality}`;
    this.weatherImo = data.weatherImo;
  }
  renderWorkoutInList(position = 'afterbegin') {
    const workoutDetails = {
      Running: {
        mainIcon: '🏃‍♂️',
        thirdValue: this.pace,
        thirdUnit: 'min/km',
        iconOfFourth: '🦶🏼',
        unitOfFourth: 'spm',
        valueOfFourth: this.cadence,
        hoverTextBtnEdit: 'hover:text-brand--2',
        hoverBorderBtnEdit: 'hover:border-brand--2/30',
      },
      Cycling: {
        mainIcon: '🚴‍♀️',
        thirdValue: this.speed,
        thirdUnit: 'km/h',
        iconOfFourth: '⛰',
        unitOfFourth: 'meters',
        valueOfFourth: this.elevationGain,
        hoverTextBtnEdit: 'hover:text-brand--1',
        hoverBorderBtnEdit: 'hover:border-brand--1/30',
      },
    };
    const HTMLOfRow = `<li class="workout-card workout-${this.type}" data-id="${this.id}">
              <div class="flex justify-between flex-wrap gap-8">
                <h2 class="workout-title">Get Data...</h2>
                <div class="workout-actions flex items-center gap-2">
                   <button class="btn-edit-workout rounded-lg border border-white/5 bg-dark--1/60 p-2 text-[1.1rem] text-light--2 backdrop-blur-md shadow-md transition-all duration-300 hover:scale-105 hover:bg-dark--1/90 ${workoutDetails[this.type].hoverTextBtnEdit} active:scale-95 cursor-pointer ${workoutDetails[this.type].hoverBorderBtnEdit}"
                  >    
                  ✏️ Edit
                  </button> 
                  <button class="btn-delete-workout rounded-lg border border-red-500/10 bg-red-500/5 p-2 text-[1.1rem] text-red-400 backdrop-blur-md shadow-md transition-all duration-300 hover:scale-105 hover:bg-red-500/20 hover:border-red-500/30 active:scale-95 cursor-pointer"
                  >
                  🗑️ Delete
                  </button>
                </div>
                <div class="workout-details">
                    <div class="workout-detail workout-detail-weather text-xl">
                      <span class="workout-icon">🌡️</span>
                      <output class="workout-value text-xl">--</output>
                    </div>
                </div>
              <div class="workout-details">
                <div class="workout-detail workout-detail-distance">
                  <span class="workout-icon">${workoutDetails[this.type].mainIcon}</span>
                  <output class="workout-value">${this.distance}</output>
                  <span class="workout-unit">km</span>
                </div>
                <div class="workout-detail workout-detail-duration">
                  <span class="workout-icon">⏱</span>
                  <output class="workout-value">${this.duration}</output>
                  <span class="workout-unit">min</span>
                </div>
                <div class="workout-detail workout-detail-calculeted">
                  <span class="workout-icon">⚡️</span>
                  <output class="workout-value">${workoutDetails[this.type].thirdValue.toFixed(1)}</output>
                  <span class="workout-unit">${workoutDetails[this.type].thirdUnit}</span>
                </div>
                <div class="workout-detail workout-detail-dynamic">
                  <span class="workout-icon">${workoutDetails[this.type].iconOfFourth}</span>
                  <output class="workout-value">${workoutDetails[this.type].valueOfFourth}</output>
                  <span class="workout-unit">${workoutDetails[this.type].unitOfFourth}</span>
                </div>
              </div>
          </li>`;
    elements.containerWorkouts.insertAdjacentHTML(position, HTMLOfRow);
    return this;
  }
  async renderWorkoutContent() {
    await this.contentWorkout();
    const card = document.querySelector(`[data-id="${this.id}"]`);
    const workoutTitleEl = card.querySelector('.workout-title');
    const workoutWeatherContentEl = card.querySelector('.workout-value');
    const workoutWeatherIconEL = card.querySelector('.workout-icon');
    workoutWeatherIconEL.textContent = this.weatherImo;
    workoutWeatherContentEl.textContent = this.weatherContent;
    workoutTitleEl.textContent = this.contentWorkoutTitle;
  }
}
class Running extends Workout {
  type = 'Running';
  constructor(data) {
    super(data);
    this.cadence = +data.cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this;
  }
}
class Cycling extends Workout {
  type = 'Cycling';
  constructor(data) {
    super(data);
    this.elevationGain = +data.elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this;
  }
}
class App {
  #map;
  #initCoords;
  #pathCurrCoords = [];
  #currWorkoutObjectForEditBtn;
  #currWorkoutElForEditBtn;
  #workoutsArr = [];
  #mapZoom = 18;
  #currPolyline;
  constructor() {
    this.#getPosition();
    elements.inputType.addEventListener('change', this.#toggleElevationField.bind(this));
    elements.formNew.addEventListener('submit', this.#newWorkout.bind(this));
    elements.goToMyPosition.addEventListener('click', this.#toMyPosition.bind(this));
    elements.resetAllBtn.addEventListener('click', this.#reset.bind(this));
    elements.containerWorkouts.addEventListener('click', this.#handleWorkoutClick.bind(this));
    elements.formEdit.addEventListener('submit', this.#submitBtnDialog.bind(this));
    elements.cancelBtnDialog.addEventListener('click', this.#closeDialog.bind(this));
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      this.#closeDialog.call(this);
    });
    elements.closeBtnDialog.addEventListener('click', this.#closeDialog.bind(this));
    elements.btnClosePopup.addEventListener('click', this.#closePopupAction);
    elements.sortBtn.addEventListener('click', this.#sort.bind(this));
    elements.btnFitBounds.addEventListener('click', this.#fitBoundsFun.bind(this));
    elements.finshDrawBtn.addEventListener('click', this.#showForm.bind(this));
  }
  #getPosition() {
    navigator.geolocation.getCurrentPosition(this.#loadMap.bind(this), () => alert('Could not get your position'));
  }
  #loadMap(pos) {
    const { latitude, longitude } = pos.coords;
    this.#initCoords = [latitude, longitude];
    this.#map = L.map('map').setView(this.#initCoords, this.#mapZoom);
    L.tileLayer('https://{s}.tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.jawg.io/">JawgMaps</a>',
      subdomains: 'abcd',
      accessToken: 'dBv3rRX6DwrICuH07D8NUIdU3Rk6IyuDwb604GmOv41WIWDKKCjULw3dukF2A5ck',
    }).addTo(this.#map);
    this.#map.on('click', this.#LivePolyLineDraw.bind(this));
    this.#renderDataLocalStorage();
    this.#showBtns();
  }
  #setVeiwInLastWorkout() {
    const bounds = L.latLngBounds(this.#workoutsArr.at(-1).pathCoords);
    const center = bounds.getCenter();
    const targetZoom = this.#map.getBoundsZoom(bounds, false, [30, 30]);
    this.#map.setView(center, targetZoom);
  }
  async #renderDataLocalStorage() {
    const workouts = JSON.parse(localStorage.getItem('workouts'));
    if (!workouts || !workouts.length) return;
    const workoutClasses = {
      Running: Running,
      Cycling: Cycling,
    };
    for (const workout of workouts) {
      const workoutClass = workoutClasses[workout.type];
      const workoutInstance = new workoutClass(workout);
      workoutInstance.renderWorkoutInList();
      await workoutInstance.renderWorkoutContent();
      this.#drawPolyline(workoutInstance);
      this.#workoutsArr.push(workoutInstance);
    }
    this.#setVeiwInLastWorkout();
  }
  #showPopup(message, bg = 'bg-brand--2') {
    elements.popupAction.classList.remove('bg-brand--2', 'bg-red-400');
    elements.popupAction.classList.add(bg);
    const messageEl = elements.popupAction.querySelector('.text-popup');
    messageEl.textContent = message;
    elements.popupAction.classList.remove('hidden-popup');
    setTimeout(() => elements.popupAction.classList.add('hidden-popup'), 5000);
  }
  #closePopupAction() {
    elements.popupAction.classList.add('hidden-popup');
  }
  #showPopupConfirm(message, actionToExecute) {
    const messageEl = elements.confirmPopup.querySelector('.text-popup');
    messageEl.textContent = message;
    elements.confirmPopup.classList.remove('hidden-popup-confirm');
    elements.overlay.classList.remove('hidden-overlay');
    elements.overlay.classList.add('blur-overlay');
    const onYes = () => {
      actionToExecute();
      this.#closePopupConfirm();
    };
    const onNo = () => {
      this.#closePopupConfirm();
    };
    elements.btnYes.addEventListener('click', onYes, { once: true });
    elements.btnNo.addEventListener('click', onNo, { once: true });
  }
  #closePopupConfirm = () => {
    elements.confirmPopup.classList.add('hidden-popup-confirm');
    elements.overlay.classList.add('hidden-overlay');
    elements.overlay.classList.remove('blur-overlay');
  };
  #showBtns() {
    elements.ContainerBtns.classList.remove('hidden-btns');
  }
  #showBtnFinshDraw(ability = false) {
    elements.finshDrawBtn.disabled = ability;
  }
  #abilityClickOMap(ability = 'none') {
    if (ability === 'none') elements.overlayMap.classList.remove('hidden-overlay');
    else elements.overlayMap.classList.add('hidden-overlay');
  }
  #showForm(mapEvent) {
    this.#abilityClickOMap();
    elements.formNew.classList.remove('form-hidden');
    elements.inputDistance.focus();
  }
  #toggleInputState(inputElement, className) {
    const hasClass = inputElement.closest('.form-row').classList.contains(className);
    if (hasClass) {
      inputElement.disabled = true;
      inputElement.blur();
    } else inputElement.disabled = false;
    elements.inputDistance.focus();
  }
  #toggleElevationField() {
    const formRowCadence = elements.inputCadence.closest('.form-row');
    const formRowElevation = elements.inputElevation.closest('.form-row');
    formRowCadence.classList.toggle('form-row-hidden');
    this.#toggleInputState(elements.inputCadence, 'form-row-hidden');
    formRowElevation.classList.toggle('form-row-hidden');
    this.#toggleInputState(elements.inputElevation, 'form-row-hidden');
    elements.submitBtn.classList.toggle('submit-btn-theme-1');
  }
  #getDataFromForm() {
    const distance = elements.inputDistance;
    const duration = elements.inputDuration;
    const typeOfWorkout = elements.inputType.value;
    const thirdInput = typeOfWorkout === 'Running' ? elements.inputCadence : elements.inputElevation;
    return {
      distance,
      duration,
      thirdInput,
      typeOfWorkout,
    };
  }
  #formVaildData(...inputs) {
    return inputs.every(inp => inp >= 1);
  }
  #hiddenForm(input1, input2, input3, form) {
    input1.value = input2.value = input3.value = '';
    elements.inputType.focus();
    form.classList.add('form-hidden');
    this.#abilityClickOMap('auto');
  }
  #toMyPosition() {
    this.#map.flyTo(this.#initCoords, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  #moveToMapClicker(e) {
    const workoutTargetId = +e.target.closest('.workout-card').dataset.id;
    const workoutCurrClickObject = this.#workoutsArr.find(workout => workout.id === workoutTargetId);
    const bounds = L.latLngBounds(workoutCurrClickObject.pathCoords);
    const center = bounds.getCenter();
    const targetZoom = this.#map.getBoundsZoom(bounds, false, [30, 30]);
    this.#map.flyTo(center, targetZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  #setItemInLoacalStorage(workoutArr) {
    const cleanWorkoutArr = workoutArr.map(workout => {
      const copy = { ...workout };
      delete copy.polyline;
      return copy;
    });
    localStorage.setItem('workouts', JSON.stringify(cleanWorkoutArr));
  }
  #toggleDynmicFieldDialog(workoutObject) {
    const labelDynamicFeild = elements.dynamicFieldContainer.querySelector('label');
    const inputDynamicFeild = elements.dynamicFieldContainer.querySelector('input');
    if (workoutObject.type === 'Cycling') {
      labelDynamicFeild.textContent = 'Elev Gain (m)';
      inputDynamicFeild.setAttribute('placeholder', 'meters');
    } else {
      labelDynamicFeild.textContent = 'Cadence (step/min)';
      inputDynamicFeild.setAttribute('placeholder', 'step/min');
    }
  }
  #displayDialog(workoutObject) {
    this.#toggleDynmicFieldDialog(workoutObject);
    elements.overlay.classList.add('duration-500', 'transition-[background-color,backdrop-blur]');
    elements.overlay.classList.remove('hidden-overlay');
    elements.overlay.classList.add('blur-overlay');
    elements.dialog.setAttribute('aria-modal', true);
    elements.dialog.classList.add('transition-[translate,opacity]', 'duration-300');
    elements.dialog.classList.remove('animate-dialog');
  }
  #clearInputs(data) {
    Object.values(data).forEach(el => (el.value = ''));
  }
  #closeDialog() {
    const data = this.#getDataEditDialog();
    elements.overlay.classList.add('hidden-overlay');
    elements.overlay.classList.remove('blur-overlay');
    elements.dialog.setAttribute('aria-modal', false);
    elements.dialog.classList.add('animate-dialog');
    this.#clearInputs(data);
  }
  #getDataEditDialog() {
    return {
      distanceEdit: document.getElementById('editDistance'),
      durationEdit: document.getElementById('editDuration'),
      dynamicEditInput: elements.dynamicFieldContainer.querySelector('input'),
    };
  }
  #isVaildDataDialog(data) {
    return data.distanceEdit.value >= 1 && data.durationEdit.value >= 1 && data.dynamicEditInput.value >= 1;
  }
  #updateWorkoutObject(data, workoutObject) {
    workoutObject.distance = +data.distanceEditInput.value;
    workoutObject.duration = +data.durationEditInput.value;
    workoutObject[data.typeWorkout ? 'cadence' : 'elevationGain'] = +data.dynamicEditInput.value;
    data.typeWorkout ? workoutObject.calcPace() : workoutObject.calcSpeed();
  }
  #dispalyNewDataWorkout(data, workoutObject) {
    data.distanceElement.textContent = workoutObject.distance;
    data.durationElement.textContent = workoutObject.duration;
    data.dynamicElement.textContent = data.dynamicEditInput.value;
    data.calculetedElement.textContent = workoutObject[data.typeWorkout ? 'pace' : 'speed'].toFixed(1);
  }
  #setNewDataInWorkout(data, workoutEl, workoutObject) {
    const { distanceEdit, durationEdit, dynamicEditInput } = data;
    const dataNewWorkout = {
      distanceEditInput: distanceEdit,
      durationEditInput: durationEdit,
      dynamicEditInput: dynamicEditInput,
      distanceElement: workoutEl.querySelector('.workout-detail-distance > .workout-value'),
      durationElement: workoutEl.querySelector('.workout-detail-duration > .workout-value'),
      dynamicElement: workoutEl.querySelector('.workout-detail-dynamic > .workout-value'),
      calculetedElement: workoutEl.querySelector('.workout-detail-calculeted > .workout-value'),
      typeWorkout: workoutObject.type === 'Running',
    };
    this.#updateWorkoutObject(dataNewWorkout, workoutObject);
    this.#dispalyNewDataWorkout(dataNewWorkout, workoutObject);
    this.#setItemInLoacalStorage(this.#workoutsArr);
  }
  #submitBtnDialog(e) {
    e.preventDefault();
    const data = this.#getDataEditDialog();
    if (!this.#isVaildDataDialog(data)) {
      this.#showPopup('🔴 Please fill out all fields with valid positive numbers!', 'bg-red-400');
      return;
    }
    this.#setNewDataInWorkout(data, this.#currWorkoutElForEditBtn, this.#currWorkoutObjectForEditBtn);
    this.#closeDialog();
    this.#clearInputs(data);
    this.#showPopup('🟢 Workout Edited successfully!');
  }
  #editPopup(e) {
    const btnSubmit = elements.dialog.querySelector('button[type="submit"]');
    this.#currWorkoutElForEditBtn = e.target.closest('.workout-card');
    this.#currWorkoutObjectForEditBtn = this.#workoutsArr.find(
      workout => workout.id === +this.#currWorkoutElForEditBtn.dataset.id,
    );
    this.#displayDialog(this.#currWorkoutObjectForEditBtn);
  }
  #deleteWorkout(e) {
    this.#showPopupConfirm('Are you sure you want to delete this workout? 🗑️', actionToExecute => {
      const workoutToDeleteEl = e.target.closest('.workout-card');
      const workoutObject = this.#workoutsArr.find(workout => workout.id === +workoutToDeleteEl.dataset.id);
      this.#workoutsArr = this.#workoutsArr.filter(workout => workout.id !== +workoutToDeleteEl.dataset.id);
      workoutObject.polyline.remove();
      workoutToDeleteEl.remove();
      this.#setItemInLoacalStorage(this.#workoutsArr);
      this.#showPopup('🟢 Workout deleted successfully');
    });
  }
  #handleWorkoutClick(e) {
    if (e.target.closest('.btn-edit-workout')) {
      this.#editPopup(e);
      return;
    }
    if (e.target.closest('.btn-delete-workout')) {
      this.#deleteWorkout(e);
      return;
    }
    if (e.target.closest('.workout-card')) {
      this.#moveToMapClicker(e);
      return;
    }
  }
  #LivePolyLineDraw(mapEvent) {
    const { lat, lng } = mapEvent.latlng;
    this.#pathCurrCoords.push([lat, lng]);
    if (this.#pathCurrCoords.length >= 2) this.#showBtnFinshDraw();
    const polylineOptions = {
      color: '#000',
      weight: 5,
      opacity: 0.7,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '10, 10',
    };
    if (this.#currPolyline) this.#currPolyline.setLatLngs(this.#pathCurrCoords);
    else this.#currPolyline = L.polyline(this.#pathCurrCoords, polylineOptions).addTo(this.#map);
  }
  #drawPolyline(workoutObject, shouldAutoPan = false) {
    if (this.#currPolyline) this.#map.removeLayer(this.#currPolyline);
    const typeColor = {
      Running: '#00c46a',
      Cycling: '#ffb545',
    };
    const customPopup = L.popup({
      maxWidth: 300,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      autoPan: shouldAutoPan,
      className: `custom-map-popup ${workoutObject.type}-popup`,
    }).setContent(workoutObject.contentWorkoutTitle);
    workoutObject.polyline = L.polyline(workoutObject.pathCoords, {
      color: typeColor[workoutObject.type],
      weight: 5,
      lineCap: 'round',
      dashArray: '10, 10',
    })
      .addTo(this.#map)
      .bindPopup(customPopup)
      .openPopup();
    this.#pathCurrCoords = [];
    this.#currPolyline = null;
  }
  async #newWorkout(e) {
    try {
      e.preventDefault();
      const { typeOfWorkout, distance, duration, thirdInput } = this.#getDataFromForm();
      if (!this.#formVaildData(distance.value, duration.value, thirdInput.value)) {
        this.#showPopup('🔴 Please fill out all fields with valid positive numbers!', 'bg-red-400');
        return;
      }
      const workoutClasses = {
        Running,
        Cycling,
      };
      const workoutClass = workoutClasses[typeOfWorkout];
      const workoutObject = new workoutClass({
        pathCoords: this.#pathCurrCoords,
        distance: distance.value,
        duration: duration.value,
        [typeOfWorkout === 'Running' ? 'cadence' : 'elevationGain']: thirdInput.value,
      });
      workoutObject.renderWorkoutInList();
      await workoutObject.renderWorkoutContent();
      this.#drawPolyline(workoutObject, true);
      this.#workoutsArr.push(workoutObject);
      this.#setItemInLoacalStorage(this.#workoutsArr);
      this.#hiddenForm(distance, duration, thirdInput, elements.formNew);
      this.#showBtnFinshDraw(true);
      this.#showPopup('🟢 Workout added successfully!');
    } catch (err) {
      this.#showPopup(err.message, 'bg-red-400');
      const { typeOfWorkout, distance, duration, thirdInput } = this.#getDataFromForm();
      document.querySelector('.workout-card').remove();
      this.#hiddenForm(distance, duration, thirdInput, elements.formNew);
      elements.finshDrawBtn.disabled = true;
      elements.overlayMap.classList.add('hidden-overlay');
      this.#pathCurrCoords = [];
      this.#currPolyline.remove();
      this.#currPolyline = null;
      console.error(err);
    }
  }
  #reset() {
    const isAnyWorkout = JSON.parse(localStorage.getItem('workouts'));
    if (!isAnyWorkout || !isAnyWorkout.length) {
      this.#showPopup("🔍 You don't have any registered workouts yet!", 'bg-red-400');
      return;
    }
    this.#showPopupConfirm('Are you sure you want to delete all workouts? 🗑️', execute => {
      localStorage.removeItem('workouts');
      location.reload();
    });
  }
  #sort() {
    const sortBy = elements.sortBy.value;
    const isAnyWorkout = localStorage.getItem('workouts');
    if (!isAnyWorkout || !isAnyWorkout.length) {
      this.#showPopup("🔍 You don't have any registered workouts yet!", 'bg-red-400');
      return;
    }
    const isSorted = this.#workoutsArr.every((el, i, arr) => {
      if (i === 0) return true;
      return el[sortBy] >= arr[i - 1][sortBy];
    });
    if (isSorted) {
      this.#showPopup(`Workouts already sorted by: ${sortBy} 📊`);
      return;
    }
    elements.containerWorkouts.innerHTML = '';
    this.#workoutsArr.sort((a, b) => b[sortBy] - a[sortBy]);
    this.#workoutsArr.forEach(el => {
      el.renderWorkoutInList('beforeend');
      const card = elements.containerWorkouts.querySelector(`[data-id="${el.id}"]`);
      if (card) {
        card.querySelector('.workout-title').textContent = el.contentWorkoutTitle;
        card.querySelector('.workout-detail-weather').querySelector('.workout-icon').textContent = el.weatherImo;
        card.querySelector('.workout-detail-weather').querySelector('.workout-value').textContent = el.weatherContent;
      }
    });
    this.#setItemInLoacalStorage(this.#workoutsArr.reverse());
    this.#showPopup(`Workouts sorted by ${sortBy} successfully! 📊`);
  }
  #fitBoundsFun() {
    const isAnyWorkout = localStorage.getItem('workouts');
    if (!isAnyWorkout || !isAnyWorkout.length) {
      this.#showPopup("🔍 You don't have any registered workouts yet!", 'bg-red-400');
      return;
    }
    const allpathCoords = this.#workoutsArr.map(workout => workout.pathCoords);
    const bounds = L.latLngBounds(allpathCoords);
    const center = bounds.getCenter();
    const targetZoom = this.#map.getBoundsZoom(bounds, false, [170, 170]);
    this.#map.flyTo(center, targetZoom, {
      animate: true,
      duration: 1.5,
    });
    this.#showPopup('Flying to see all workouts! ✈️🗺️');
  }
}
const app = new App();
