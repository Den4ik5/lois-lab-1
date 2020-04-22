function validateFormula(formula) {
    return formula.match(/^([10A-Z()|&!~]|->)*$/g) && (formula.match(/^[A-Z10]$/) ||
        (!formula.match(/\)\(/) && !formula.match(/[A-Z10]([^|&~]|(?!->))[10A-Z]/) &&
        !formula.match(/[^(]![A-Z10]/) && !formula.match(/![A-Z10][^)]/) &&
        !formula.match(/\([A-Z10]\)/) && validateBracing(formula)));
}

function validateBracing(formula) {
    if (formula.split('(').length !== formula.split(')').length) { // -1 to both?
        return false;
    }

    let formulaCopy = formula;
    let replacingSymbol = 'X';

    while (formulaCopy.match(/([|&~]|->)/g) || !formulaCopy.match(/^[X()]+$/g)) {
        let snapshot = formulaCopy;

        formulaCopy = formulaCopy.replace(/\(![A-Z01]\)/g, replacingSymbol);
        formulaCopy = formulaCopy.replace(/\([A-Z01]([|&~]|->)[A-Z01]\)/g, replacingSymbol);

        if (formulaCopy === snapshot) {
            return false;
        }
    }

    return formulaCopy === replacingSymbol;
}

function check(formula) {
    let messageElement = document.getElementById("message");

    let isFormulaValid = validateFormula(formula);
    messageElement.innerHTML = isFormulaValid ? '' : "Введите корректную формулу";
    
    if (!isFormulaValid) {
        return;
    }

    messageElement.innerHTML = isSKNF(formula) ? "Формула является СКНФ" : "Формула не является СКНФ";
}

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
