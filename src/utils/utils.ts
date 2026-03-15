export function drawMatrixHUD(elements: Float32Array | number[], title: string = "View Matrix") {
    const hud = document.getElementById("hud");
    if (!hud) return;

    // Funkcja pomocnicza:
    // Formatujemy liczbę do 2 miejsc po przecinku i upewniamy się, 
    // że zajmuje zawsze 6 znaków (padStart). 
    // Dzięki temu kolumny nie będą "skakać", gdy pojawi się minus!
    const f = (n: number) => n.toFixed(2);

    // Wyciągamy liczby wierszami (Row-Major), mimo że w tablicy są kolumnami (Column-Major)
    // Zauważ przeskoki indeksów o +4
    const row0 = `${f(elements[0])}  ${f(elements[1])}  ${f(elements[2])}  ${f(elements[3])}`;
    const row1 = `${f(elements[4])}  ${f(elements[5])}  ${f(elements[6])}  ${f(elements[7])}`;
    const row2 = `${f(elements[8])}  ${f(elements[9])}  ${f(elements[10])}  ${f(elements[11])}`;
    const row3 = `${f(elements[12])}  ${f(elements[13])}  ${f(elements[14])}  ${f(elements[15])}`;

    // Wrzucamy gotowy HTML do HUDa
    hud.innerHTML = `
        <div style="color: #fff; margin-bottom: 8px; font-weight: bold;">${title}</div>
        <pre style="margin: 0; line-height: 1.5;">
[ ${row0} ]
[ ${row1} ]
[ ${row2} ]
[ ${row3} ]
        </pre>
    `;
}