
/* ===== Появление элементов при прокрутке ===== */

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(
        ".names, .couple, .wedding-date, .wedding-title, " +
        ".calendar, .lights, .location-title, .location-info, " +
        ".schedule-title, .schedule-item, .dress-title, " +
        ".dress-description, .dress-colors, .details__text, " +
        ".guest-form-title, .guest-form-description, .rsvp-form"
    );

    const images = document.querySelectorAll(
        ".couple-photo, .date-photo, .calendar-image, " +
        ".lights-image, .polaroid, .schedule-image"
    );

    sections.forEach(element => element.classList.add("reveal"));
    images.forEach(element => element.classList.add("reveal-image"));

    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".reveal, .reveal-image")
            .forEach(element => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
    });

    document.querySelectorAll(".reveal, .reveal-image")
        .forEach(element => observer.observe(element));
});


/* ===== Отправка свадебной анкеты в Google Таблицы ===== */
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("rsvp-form");
    const message = document.getElementById("rsvp-message");

    if (!form || !message) return;

    const scriptURL = "https://script.google.com/macros/s/AKfycbzl7rBrtsOqMauZjRGTu5C53pVuYOp2GpCQ43IivFOxK7ile_CzP-jfjTdWOCo1BcYYfA/exec";

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const button = form.querySelector(".rsvp-button");
        const originalText = button.textContent;

        const data = {
            guestName: form.elements.guestName.value.trim(),
            attendance: form.elements.attendance.value,
            drink: form.elements.drink.value,
            wishes: form.elements.wishes.value.trim()
        };

        button.disabled = true;
        button.textContent = "Отправляем...";
        message.textContent = "";

        const iframe = document.createElement("iframe");
        iframe.name = "rsvp-submit-frame";
        iframe.hidden = true;
        document.body.appendChild(iframe);

        const sender = document.createElement("form");
        sender.method = "POST";
        sender.action = scriptURL;
        sender.target = iframe.name;
        sender.acceptCharset = "UTF-8";
        sender.hidden = true;

        const field = document.createElement("input");
        field.type = "hidden";
        field.name = "payload";
        field.value = JSON.stringify(data);
        sender.appendChild(field);
        document.body.appendChild(sender);

        // Сообщаем о результате после отправки запроса.
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            button.disabled = false;
            button.textContent = originalText;
            message.textContent =
                "Спасибо за ответ! Если данные не появились в таблице, сообщите нам.";
            form.reset();
            sender.remove();
            iframe.remove();
        };

        iframe.addEventListener("load", () => {
            if (iframe.dataset.submitted === "yes") finish();
        });

        iframe.dataset.submitted = "yes";
        sender.submit();

        // Запасной выход, если браузер не сообщает о загрузке ответа.
        window.setTimeout(finish, 4000);
    });
});
