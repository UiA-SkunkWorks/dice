const DEFAULT_COLOR = "#ffffff"
let dice_id = 0;

const diceSidesElement = document.querySelector("#diceSides");
const diceColorElement = document.querySelector("#diceColor");
const addBt = document.querySelector("#addBt");
const roleBt = document.querySelector("#roleBt");
const diceCollection = document.querySelector("#diceCollection");
const saveBT = document.querySelector("#saveBt");
const shareBt = document.querySelector("#shareBt");
const usageBt = document.querySelector("#usageBt");
const usageDialog = document.querySelector("#usageDialog");
const closeUsage = document.querySelector("#closeUsage");

usageBt.onclick = () => usageDialog.showModal();
closeUsage.onclick = () => usageDialog.close();

addBt.onclick = (e) => {
    const sides = diceSidesElement.value * 1;
    const color = diceColorElement.value || DEFAULT_COLOR;
    diceCollection.appendChild(createDieElement(sides, color, dice_id));
    dice_id++
};

roleBt.onclick = (e) => {
    rolleDie();
};

function rolleDie() {
    diceCollection.querySelectorAll("div.die").forEach(die => {
        if (!die.classList.contains("keep")) {
            const sides = parseInt(die.getAttribute("data-sides"), 10) || 6;
            die.textContent = Math.ceil(Math.random() * sides);
        }
    });
}

function createDieElement(sides, color, id) {

    const die = document.createElement("div");
    die.textContent = sides;
    die.style.backgroundColor = color;
    die.style.color = getContrastTextColor(color);
    die.setAttribute("data-color", color);
    die.setAttribute("data-sides", sides);
    die.setAttribute("data-id", id)
    die.setAttribute("araia-label", "die")
    die.classList.add("die");
    die.onclick = (e) => {
        e.stopPropagation();
        die.classList.toggle("keep");
    };

    const label = document.createElement("div");
    label.textContent = `D${sides}`;
    label.style.fontSize = "0.75em";
    label.style.marginTop = "4px";
    label.style.textAlign = "center";

    const container = document.createElement("div");
    container.appendChild(die);
    container.appendChild(label);

    return container;
}

function getContrastTextColor(bgColor) {
    bgColor = bgColor.replace("#", "");
    const r = parseInt(bgColor.substr(0, 2), 16);
    const g = parseInt(bgColor.substr(2, 2), 16);
    const b = parseInt(bgColor.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
}

saveBT.onclick = (e) => {
    const id = prompt("Enter save ID:");
    //TODO: make URL safe.
    if (id) {
        save(id);
    }
};

shareBt.onclick = async (e) => {
    const diceData = [];
    diceCollection.querySelectorAll("div.die").forEach(die => {
        diceData.push({
            sides: die.getAttribute("data-sides"),
            color: die.getAttribute("data-color") || DEFAULT_COLOR,
        });
    });

    if (diceData.length === 0) return;

    let diceString = '';
    let lastColor = null;
    diceData.forEach(d => {
        if (d.color !== lastColor) {
            diceString += d.color.replace("#", "|");
            lastColor = d.color;
        }
        diceString += `d${d.sides}`;
    });

    const url = `${window.location.origin}${window.location.pathname}?dice=${encodeURIComponent(diceString)}`;
    try {
        await navigator.clipboard.writeText(url);
        alert("URL copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy URL:", err);
    }
}

function save(id) {
    const diceData = [];
    diceCollection.querySelectorAll("div.die").forEach(die => {
        diceData.push({
            sides: die.getAttribute("data-sides"),
            color: die.getAttribute("data-color") || DEFAULT_COLOR,
            id: die.getAttribute("data-id"),
            keep: die.classList.contains("keep")
        });
    });
    localStorage.setItem(id, JSON.stringify(diceData));
}

function sync(id) {
    diceCollection.innerHTML = '';
    const diceData = JSON.parse(localStorage.getItem(id));
    if (diceData && Array.isArray(diceData)) {
        diceData.forEach(d => {
            const die = createDieElement(d.sides, d.color, d.id);
            if (d.keep) {
                die.classList.add("keep");
            }
            diceCollection.appendChild(die);
        });
    }
}

function initFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const config = params.get("dice")?.replace("|", "#");
    const ui = params.get("ui");
    if (id) {
        sync(id);
    } else if (config) {
        const pattern = /(#[0-9a-f]{6})?d(\d+)/gi;
        let color = DEFAULT_COLOR;
        let match;
        while ((match = pattern.exec(config)) !== null) {
            const sides = parseInt(match[2], 10);
            if (match[1]) {
                color = match[1];
            }
            diceCollection.appendChild(createDieElement(sides, color, dice_id));
            dice_id++;
        }
    }

    if (ui === "false") {

        [...document.body.children].forEach(div => {
            if (div.id != "diceCollection") {
                div.style.display = "none";
                div.setAttribute("hidden", true);
            }
        });

        document.body.onclick = (e) => {
            rolleDie();
        }


    }
}

document.addEventListener("DOMContentLoaded", () => {
    initFromQuery();
});


lucide.createIcons();