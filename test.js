var formulas = [];
var answers = [];
var countOfQuestions = 10;

function createTest() {
    let formula = generateFormula();
    formulas.push(formula);
    answers.push(isSKNF(formula) ? "yes" : "no");

    let i = 1;
    
    while (i < countOfQuestions) {
        while (formulas.indexOf(formula) !== -1) {
            formula = generateFormula();
        }
    
        formulas.push(formula);
        answers.push(isSKNF(formula) ? "yes" : "no");
    
        i++;
    }
}

function renderTest() {
    formulas.forEach((formula, i) => {
        document.body.innerHTML += '<p id="formula'+ i + '">' + formula + '</p>' +
        '<input type="radio" id="no' + i +'" name="name' + i + '" value="нет">' +
        '<label for="no' + i + '">нет</label>' +
        '<input type="radio" id="yes' + i + '" name="name' + i + '" value="да">' +
        '<label for="yes' + i + '">да</label>' +
        '<br><br>';
    });
    document.body.innerHTML += '<button class="button" type="submit" onclick="finishTest()">Завершить тест</button>';
}

createTest();
renderTest();

function isSKNF(formula) {
    let atoms = [...new Set(formula.split(/[^A-Z]/).filter(atom => atom !== ''))];
    if (atoms.length === 0) {
        return false;
    }

    // содержит константы или недопустимые операции
    if (formula.match(/[01~]|->/g)) {
        return false;
    }

    // содержит сложные отрицания
    if (formula.match(/!\(/g)) {
        return false;
    }

    // каждый атом должен входить в формулу одинаковое количество раз,
    // столько же, сколько и остальные
    if (!isAtomsCountsEqual(formula, atoms)) {
        return false;
    }

    if (!areGroupsFormedWell(formula, atoms)) {
        return false;
    }

    return true;
}

function isAtomsCountsEqual(formula, atoms) {
    let eachAtomCount = formula.match(new RegExp(atoms[0], 'g')).length;
    let atomCount = 0;
    let isCountsEqual = true;

    atoms.forEach(atom => {
        atomCount = formula.match(new RegExp(atom, 'g')).length;

        isCountsEqual &= (eachAtomCount === atomCount);
    });

    return isCountsEqual;
}

function areGroupsFormedWell(formula, atoms) {
    let groups = formula.split('&').filter(group => group !== '');
    if (groups.length > Math.pow(2, atoms.length)) {
        return false;
    }

    let groupsAtoms = [];
    let areFormedWell = true;

    groups.forEach(group => {
        groupsAtoms.push(group.match(/!?[A-Z]/g).sort().toString());

        atoms.forEach(atom => {
            let atomAppearance = group.match(new RegExp(atom, 'g'));

            // в каждой группе каждый атом должен встречаться ровно один раз
            if (atomAppearance === null || atomAppearance.length !== 1) {
                areFormedWell = false;
            }
        });
    });

    // в каждой группе должны быть уникальные наборы
    // заданных атомов (в плане чередования отрицаний)
    if ([...new Set(groupsAtoms)].length !== groups.length) {
        areFormedWell = false;
    }

    return areFormedWell;
}

function randomIntFromOne(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

function generateFormula() {
    let formula = '';
    let countOfArgs = randomIntFromOne(3);
    let countOfGroups = randomIntFromOne(Math.pow(2, countOfArgs));
    let atoms = ['A', 'R', 'E'];

    for (i = 0; i < countOfGroups; i++) {
        let countOfArgsInParticualarGroup = countOfArgs - randomIntFromOne(countOfArgs) + 1;
        let group = '';

        if (countOfGroups !== 1 && i < countOfGroups - 1) {
            formula += '(';
        }

        for (j = 0; j < countOfArgsInParticualarGroup; j++) {
            if (countOfArgsInParticualarGroup !== 1 && j < countOfArgsInParticualarGroup - 1) {
                group += '(';
            }

            let isNegative = (Math.random() >= 0.5);
            group += (isNegative ? '(!' : '') + atoms[j] + (isNegative ? ')' : '');
            if (j < countOfArgsInParticualarGroup - 1) {
                let random  = Math.random();
                group += ((random >= 0.2) ? '|' : (random >= 0.1 ? '&' : (random >= 0.05 ? '~' : '->')));
            }
        }

        for (j = 0; j < countOfArgsInParticualarGroup - 1; j++) {
            if (countOfArgsInParticualarGroup !== 1) {
                group += ')';
            }
        }

        formula += group;

        if (i < countOfGroups - 1) {
            let random  = Math.random();
            formula += ((random >= 0.2) ? '&' : (random >= 0.1 ? '|' : (random >= 0.05 ? '~' : '->')));
        }
    }

    for (j = 0; j < countOfGroups - 1; j++) {
        if (countOfGroups !== 1) {
            formula += ')';
        }
    }

    return formula;
}

function finishTest() {
    let i = 0;
    let stars = 0;
    
    while (i < countOfQuestions) {
        let answer = answers[i];

        let answerElement = document.getElementById(answer + '' + i);
        if (answerElement.checked) {
            stars++;
        }
    
        i++;
    }

    document.body.innerHTML = 'Ваша оценка: ' + stars;
}