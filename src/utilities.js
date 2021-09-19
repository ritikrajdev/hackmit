// Define our labelmap
const labelMap = {
    1: { name: 'Hello', color: 'red', reply: 'Hi' },
    2: { name: 'Thank You', color: 'yellow', reply: 'Your Welcome' },
    3: { name: 'I Love You', color: 'lime', reply: 'Love You more <3' },
    4: { name: 'Weather', color: 'blue', reply: 'Currently 30 Degrees' },
    5: { name: 'Doctor', color: 'purple', reply: 'Finding Nearby Doctors' },
}

// Define a drawing function
export const drawRect = (boxes, classes, scores, threshold, imgWidth, imgHeight, ctx, mes) => {
    for (let i = 0; i <= boxes.length; i++) {
        if (boxes[i] && classes[i] && scores[i] > threshold) {
            // Extract variables
            const [y, x, height, width] = boxes[i]
            const text = classes[i]

            // Set styling
            ctx.strokeStyle = labelMap[text]['color']
            ctx.lineWidth = 10
            ctx.fillStyle = 'white'
            ctx.font = '30px Arial'

            // DRAW!!
            ctx.beginPath()
            ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i] * 100) / 100, x * imgWidth, y * imgHeight - 10)
            ctx.rect(x * imgWidth, y * imgHeight, width * imgWidth / 2, height * imgHeight / 1.5);
            ctx.stroke()

            if (mes.at(-1)['reply'] != labelMap[text]['reply']) {
                mes.push({ message: labelMap[text]['name'], reply: labelMap[text]['reply'] })
                if (mes.length > 1)
                    mes.splice(0, 1)
            }
        }
    }
}