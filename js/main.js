
var pattern = null;
var all_cards = null;
var card_none = null;
var criterias = null;

var level = null;

function generate_dom(pat) {

	var cde = $("#code").get(0);
	cde.innerHTML = "";

	$("#cards_code").empty();

	var row = "<tr>";

	for(var s = 0; s < pat.slots; s++){
		slot = "<label for='card"+s+"'>"+String.fromCharCode("A".charCodeAt(0)+s)+" : </label><select id='card"+s+"' class='card'>";
		slot = slot + "<option selected>x</option>";

		for(var o = 0; o < pat.order; o++){
			var opt = "";

			slot = slot + "<option>"+(o+1)+"</option>";
		}

		slot = slot + '</select>';

		cde.innerHTML = cde.innerHTML + slot;

		row = row + "<td><canvas id='cards_code_"+s+"' width='200' height='220'/></td>";
	}

	row = row + "<td><canvas id='cards_code_all' width='200' height='220'/></td><td id='note'></td></tr>";

	$("#cards_code").append(row);


	row = "<tr>";

	for(var i=0; i<level.length;i++) {
		row = row + "<td><canvas id='criteria"+i+"' width='200' height='220'/></td>";
	}

	row = row + "</tr>";

	$("#cards_code").append(row);


	row = "<tr valign=top>";

	for(var i=0; i<level.length;i++) {

		var verifiers = "";
		for(var v=0; v<level[i].parent.length; v++) {
			verifiers = verifiers + "<div class='crossable' style='cursor: pointer;user-select: none;'>" + level[i].parent[v].fullname + "</div>";
		}

		row = row + "<td>"+verifiers+"</td>";
	}

	row = row + "</tr>";

	$("#cards_code").append(row);


	var str = "";

	for(var s=0; s< pat.slots; s++) {
			str = str + "<div style='display:inline;user-select: none;margin: 10px;'>" + String.fromCharCode(65+s) + "</div>";
	}
		
	str = str + "<br>";

	for(var o=0; o < pat.order; o++) {
		for(var s=0; s< pat.slots; s++) {
			str = str + "<div class='crossable' style='display:inline;cursor: pointer;user-select: none;margin: 10px;'>" + (o+1) + "</div>";
		}
		str = str + "<br>";
	}


	$("#note").append(str);


	$(".crossable").click( function(e) {
		var current = $(e.currentTarget).css("background-color");

		console.log(current);

		if (current.includes("rgb(0, 0, 0)"))
			$(e.currentTarget).css("background-color", 'white');
		else
			$(e.currentTarget).css("background-color", 'black');
	});

	$("#cheat").change(function()  {
		update(false);
	})


	$(".card").change( function () {
		update(false);
	})

	for(var i=0; i<level.length;i++) {
		$("#criteria" + i).click({idx: i}, function(e) {
			var idx = e.data.idx;

			var res = card_none.card;

			for(var s = 0; s < pattern.slots; s++){
				var v = $("#card"+s).get(0).value;
				cde = cde + v;

				var c = card_none;

				if (v != "x"){
					var vi = parseInt(v);

					c = all_cards[s][vi-1];
				}

				res = cards_compute(res, c.card);
			}


			draw_result(res, level[idx].card, level[idx].name, $("#criteria"+idx).get(0));
		})
	}


}

function pattern_load(data) {

	var idx = 0;

	var slots = parseInt(data.charAt(idx++));
	var order = parseInt(data.charAt(idx++));

	var nb = Math.pow(order, slots);

	var patterns = [];

	for(var i = 0; i < nb; i++) {
		var pat = [];

		for(var s = 0; s < slots; s++){
			pat.push(parseInt(data.charAt(idx++)));
		}

		patterns.push({
			n: pat,
		});
	}

	return { pattern: patterns, order: order, slots: slots };
}


function print_pattern(pat) {
	var out = "";
	out = out + pat.slots;
	out = out + pat.order;

	for(var i = 0; i < pat.pattern.length; i++){
		for(var s = 0; s < pat.slots; s++){
			out = out + pat.pattern[i].n[s];
		}
	}

	return out;
}

function generate_pattern(slots, order, shuffle) {
	var n = [];
	var l = Math.pow(order, slots);

	for(var o = 0; o < slots; o++){
		n.push(0);
	}

	var out = [];

	for(var i = 0; i < l; i++){
		var nn = Array(slots);

		for(var o = 0; o < slots; o++)
			nn[o] = n[o] + 1;

		for(var o = 0; o < slots; o++){
			n[slots - 1 - o]++;

			if (n[slots - 1 - o] < order)
				break;

			n[slots - 1 - o] = 0;
		}


		out.push( {n: nn} );
	}

	if (shuffle){
	 for(var i = 0; i < out.length; i++){
            var i1 = Math.floor(Math.random() * out.length);
            var i2 = Math.floor(Math.random() * out.length);

            var tmp = out[i1];
            out[i1] = out[i2];
            out[i2] = tmp;

        }
	}

	return { pattern: out, order: order, slots: slots };

}

function generate_cards(pat) {

	var c = [];

	for(var s = 0; s < pat.slots; s++){

		slot = [];

		for(var o = 0; o < pat.order; o++){


			var name = "";

			for(var ns = 0; ns < pat.slots; ns++){
				if (ns == s)
					name = name + (o+1);
				else
					name = name + "x";
			}


			slot.push(criteria_generate(pat, name, name, function(p) {
				return p.n[s] == o+1;
			}));
		}

		c.push(slot);
	}

	return c;
}

function criteria_generate(patterns, name, fullname, criteria, parent=null) {

	var tab = [];

	for(var i = 0; i < patterns.pattern.length; i++) {
		tab[i] = criteria(patterns.pattern[i]);
	}

	return {
		name: name,
		fullname: fullname,
		card: tab,
		parent: parent
	};
}

function cards_compute(card1, card2) {
	var c = [];

	for(var i = 0; i < card1.length; i++)
		c.push(card1[i] && card2[i]);

	return c;
}

function generate_code(cards, code) {
	var n1 = parseInt(code.charAt(0));
	var n2 = parseInt(code.charAt(1));
	var n3 = parseInt(code.charAt(2));

	var none = [];

	for(var i = 0; i < cards[0][0].card.length; i++)
		none.push(true);

	var c1 = { card: none, name: "xxx" };
	var c2 = { card: none, name: "xxx" };
	var c3 = { card: none, name: "xxx" };

	if (n1 > 0)
		c1 = cards[0][n1 - 1];

	if (n2 > 0)
		c2 = cards[1][n2 - 1];

	if (n3 > 0)
		c3 = cards[2][n3 - 1];



	return 	{
		name: code,
		card: cards_compute(cards_compute(c1.card, c2.card), c3.card),

		c1: c1,
		c2: c2,
		c3: c3
	};
}

function count_true(t) {

    var cnt = 0;

    for(var i = 0; i < t.length; i++){
        if (t[i] == true) {
            cnt++;
        }
    }

    return cnt;
}


function draw_card(card, name, c, p, order, slots) {

	var ctx = c.getContext('2d');

	var w = ctx.canvas.clientWidth;
	var h = ctx.canvas.clientHeight;

	ctx.clearRect(0, 0, w, h);

	var row = Math.round(Math.sqrt(card.length));
	var col = Math.ceil(card.length/row);
	var nb = col;
	if (row > nb)
		nb = row;

	var size = Math.floor((w - 10)/nb);

	ctx.strokeStyle = 'black';
	ctx.font = "16px serif";

	ctx.fillText(name, 4+p*80, 16);

	ctx.beginPath();
	ctx.roundRect(0, 0, w, h, 10);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, 20)
	ctx.lineTo(w, 20);
	ctx.stroke();


	for(var i = 0; i < card.length; i++) {
		var x = i % nb;
		var y = Math.floor(i / nb);

		if (card[i]) {
			ctx.beginPath();
			ctx.roundRect(x * size + (w - size*col)/2, y * size  + (w - size*row)/2 + 20, size-4, size-4, 2);
			ctx.stroke();
		}
	}

}


function draw_criteria(card, name, c) {
	var p = 0;

	var ctx = c.getContext('2d');
	var w = ctx.canvas.clientWidth;
	var h = ctx.canvas.clientHeight;

	ctx.clearRect(0, 0, w, h);

	var row = Math.round(Math.sqrt(card.length));
	var col = Math.ceil(card.length/row);
	var nb = col;
	if (row > nb)
		nb = row;

	var size = Math.floor((w - 10)/nb);

	ctx.strokeStyle = 'black';
	ctx.font = "16px serif";

	ctx.fillText(name, 4+p*64, 16);


	ctx.beginPath();
	ctx.roundRect(0, 0, 200, 220, 10);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, 20)
	ctx.lineTo(200, 20);
	ctx.stroke();

	for(var i = 0; i < card.length; i++) {
		var x = i % nb;
		var y = Math.floor(i / nb);

		if (card[i])
			ctx.fillStyle = 'green';
		else
			ctx.fillStyle = 'red';

		ctx.beginPath();
			ctx.roundRect(x * size + (w - size*col)/2, y * size  + (w - size*row)/2 + 20, size-4, size-4, 2);
		ctx.fill();
		ctx.fillStyle = 'black';


	}

}

function compare_array(a1, a2) {
	
	if (a1.length != a2.length)
		return false;

	for(var i=0; i < a1.length; i++) {
		if (a1[i] != a2[i])
			return false;
	}

	return true;
}

function check_level(l) {

	for(var c=0; c<l.length; c++) {

	    var o = card_none.card;

		for(var i=0; i<l.length; i++) {

			if (i != c) {
				o = cards_compute(o, l[i].card);
			}
		}

	    o_n = cards_compute(o, l[c].card);

	    if (compare_array(o, o_n)) {
	    	return false;
	    }
	}

	var s = solutions(l);

	if (s.length != 1)
		return false;

	return true;
}

function generate_level(n, d) {

	while(true) {

		var selected_criterias = [];

		for(var i = 0; i < criterias.length; i++) {

			if ((criterias[i].difficulty >= d-1) && (criterias[i].difficulty <= d))
				selected_criterias.push(criterias[i]);
		}		
		

		// Shuffle
		 for(var i = 0; i < selected_criterias.length; i++){
	        var i1 = Math.floor(Math.random() * selected_criterias.length);
	        var i2 = Math.floor(Math.random() * selected_criterias.length);

	        var tmp = selected_criterias[i1];
	        selected_criterias[i1] = selected_criterias[i2];
	        selected_criterias[i2] = tmp;
	    }


	    // Get 1 verifier by criteria
	    var crit = [];

	    for(var i=0; i<selected_criterias.length; i++) {
	        var i1 = Math.floor(Math.random() * selected_criterias[i].cards.length);
	        crit.push(selected_criterias[i].cards[i1]);
	    }

	    var l = crit.slice(0, n);

	    if (check_level(l)) {
	    	return l;
	    }

	}


}

function draw_result(card, criteria, name, c) {
	var p = 0;

	var ctx = c.getContext('2d');
	var w = ctx.canvas.clientWidth;
	var h = ctx.canvas.clientHeight;

	ctx.clearRect(0, 0, w, h);

	var row = Math.round(Math.sqrt(card.length));
	var col = Math.ceil(card.length/row);
	var nb = col;
	if (row > nb)
		nb = row;

	var size = Math.floor((w - 10)/nb);
	ctx.strokeStyle = 'black';
	ctx.font = "16px serif";

	ctx.fillText(name, 4+p*64, 16);


	ctx.beginPath();
	ctx.roundRect(0, 0, 200, 220, 10);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, 20)
	ctx.lineTo(200, 20);
	ctx.stroke();

	for(var i = 0; i < card.length; i++) {
		var x = i % nb;
		var y = Math.floor(i / nb);

		if (card[i]) {
			if (criteria[i])
				ctx.fillStyle = 'green';
			else
				ctx.fillStyle = 'red';

			ctx.beginPath();
			ctx.roundRect(x * size + (w - size*col)/2, y * size  + (w - size*row)/2 + 20, size-4, size-4, 2);
			ctx.fill();
			ctx.fillStyle = 'black';
		}
	}
}


function update(sol) {

	var cde = "";

	var res = card_none.card;

	for(var s = 0; s < pattern.slots; s++){
		var v = $("#card"+s).get(0).value;
		cde = cde + v;

		var c = card_none;

		if (v != "x"){
			var vi = parseInt(v);

			c = all_cards[s][vi-1];
		}

		res = cards_compute(res, c.card);

	    draw_card(c.card, c.name, $("#cards_code_"+s).get(0), s, pattern.order, pattern.slots);
	}

    draw_card(res, cde, $("#cards_code_all").get(0), 0, pattern.order, pattern.slots);

	for(var i = 0; i < level.length; i++){
		if (sol) {
			draw_result(res, level[i].card, level[i].fullname, $("#criteria"+i).get(0));
		}
		else {
			if ($("#cheat:checked").get(0) == undefined)
				draw_criteria(level[i].card, level[i].name, $("#criteria"+i).get(0));
			else
				draw_result(res, level[i].card, level[i].name, $("#criteria"+i).get(0));
		}
	}



}

function update_all() {
	all_cards = generate_cards(pattern);

	card_none = { name: "xxx", card: []};
	card_none.card = Array(pattern.pattern.length);
	card_none.card.fill(true);


	criterias = create_all_criteria(pattern);


	new_game();
	
}


function create_all_criteria(pat) {

	cr = [];

	var tmp;
	var n;

/*
	var a = "A".charCodeAt(0);

	// > = <
	for(var s1 = 0; s1 < pat.slots-1; s1++) {
		for(var s2 = s1+1; s2 < pat.slots; s2++) {

			var n = String.fromCharCode(a+s1) + " > | = | < " +String.fromCharCode(a+s2);

			tmp = [];
            tmp.push(criteria_generate(pat, n, String.fromCharCode(a+s1) + " > " +String.fromCharCode(a+s2), function(p) { return p.n[s1] > p.n[s2]; }));
            tmp.push(criteria_generate(pat, n, String.fromCharCode(a+s1) + " = " +String.fromCharCode(a+s2), function(p) { return p.n[s1] == p.n[s2]; }));
            tmp.push(criteria_generate(pat, n, String.fromCharCode(a+s1) + " < " +String.fromCharCode(a+s2), function(p) { return p.n[s1] < p.n[s2]; }));
			cr.push({name: n, cards: tmp});
		}
	}


	// ODD / EVEN
	for(var s1 = 0; s1 < pat.slots; s1++) {
		var n = String.fromCharCode(a+s1) + " Odd | Even";
		tmp = [];
        tmp.push(criteria_generate(pat, n, String.fromCharCode(a+s1) + " Odd", function(p) { return p.n[s1] % 2 == 1; }));
        tmp.push(criteria_generate(pat, n, String.fromCharCode(a+s1) + " Even", function(p) { return p.n[s1] % 2 == 0; }));
		cr.push({name: n, cards: tmp});
	}

*/
	//1
	tmp = [];
	n = "A = | > 1";
	tmp.push(criteria_generate(pat, n, "A = 1", function(p) { return p.n[0] == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > 1", function(p) { return p.n[0] > 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	//2, 3, 4
	tmp = [];
	n = "A < | = | > 3";
	tmp.push(criteria_generate(pat, n, "A = 3", function(p) { return p.n[0] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > 3", function(p) { return p.n[0] > 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "A < 3", function(p) { return p.n[0] < 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	tmp = [];
	n = "B < | = | > 3";
	tmp.push(criteria_generate(pat, n, "B = 3", function(p) { return p.n[1] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > 3", function(p) { return p.n[1] > 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < 3", function(p) { return p.n[1] < 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	tmp = [];
	n = "B < | = | > 4";
	tmp.push(criteria_generate(pat, n, "B = 4", function(p) { return p.n[1] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > 4", function(p) { return p.n[1] > 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < 4", function(p) { return p.n[1] < 4; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});


	//5, 6, 7
	tmp = [];
	n = "A Even | Odd";
	tmp.push(criteria_generate(pat, n, "A Even", function(p) { return p.n[0] % 2 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "A Odd", function(p) { return p.n[0] % 2 == 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	tmp = [];
	n = "B Even | Odd";
	tmp.push(criteria_generate(pat, n, "B Even", function(p) { return p.n[1] % 2 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "B Odd", function(p) { return p.n[1] % 2 == 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	tmp = [];
	n = "C Even | Odd";
	tmp.push(criteria_generate(pat, n, "C Even", function(p) { return p.n[2] % 2 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "C Odd", function(p) { return p.n[2] % 2 == 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	//8, 9, 10
	tmp = [];
	n = "(0 1 2 3)x 1";
	tmp.push(criteria_generate(pat, n, "0x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});


	tmp = [];
	n = "(0 1 2 3)x 3";
	tmp.push(criteria_generate(pat, n, "0x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});


	tmp = [];
	n = "(0 1 2 3)x 4";
	tmp.push(criteria_generate(pat, n, "0x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});


	//11, 12, 13
	tmp = [];
	n = "A < | = | > B";
	tmp.push(criteria_generate(pat, n, "A = B", function(p) { return p.n[0] == p.n[1]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > B", function(p) { return p.n[0] > p.n[1]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A < B", function(p) { return p.n[0] < p.n[1]; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	tmp = [];
	n = "A < | = | > C";
	tmp.push(criteria_generate(pat, n, "A = C", function(p) { return p.n[0] == p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > C", function(p) { return p.n[0] > p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A < C", function(p) { return p.n[0] < p.n[2]; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	tmp = [];
	n = "B < | = | > C";
	tmp.push(criteria_generate(pat, n, "B = C", function(p) { return p.n[1] == p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > C", function(p) { return p.n[1] > p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < C", function(p) { return p.n[1] < p.n[2]; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	//14, 15
	tmp = [];
	n = "(A < BC) | (B < AC) | (C < AB)";
	tmp.push(criteria_generate(pat, n, "A < BC", function(p) { return (p.n[0] < p.n[1]) && (p.n[0] < p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "B < AC", function(p) { return (p.n[1] < p.n[0]) && (p.n[1] < p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "C < AB", function(p) { return (p.n[2] < p.n[0]) && (p.n[2] < p.n[1]); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	tmp = [];
	n = "(A > BC) | (B > AC) | (C > AB)";
	tmp.push(criteria_generate(pat, n, "A > BC", function(p) { return (p.n[0] > p.n[1]) && (p.n[0] > p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "B > AC", function(p) { return (p.n[1] > p.n[0]) && (p.n[1] > p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "C > AB", function(p) { return (p.n[2] > p.n[0]) && (p.n[2] > p.n[1]); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	//16
	tmp = [];
	n = "Even > | < Odd";
	tmp.push(criteria_generate(pat, n, "Even > Odd", function(p) { return (p.n[0] % 2) + (p.n[1] % 2) + (p.n[2] % 2) < 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "Even < Odd", function(p) { return (p.n[0] % 2) + (p.n[1] % 2) + (p.n[2] % 2) >= 2; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	//17
	tmp = [];
	n = "(0 1 2 3)x Even";
	tmp.push(criteria_generate(pat, n, "0x Even", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] % 2 == 0) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x Even", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] % 2 == 0) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x Even", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] % 2 == 0) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x Even", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] % 2 == 0) c=c+1; return c == 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	//18
	tmp = [];
	n = "(A + B + C) Even | Odd";
	tmp.push(criteria_generate(pat, n, "A + B + C Even", function(p) { return (p.n[0] + p.n[1] + p.n[2]) % 2 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "A + B + C Odd", function(p) { return (p.n[0] + p.n[1] + p.n[2]) % 2 == 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});


	//19
	tmp = [];
	n = "(A + B) < | = | > 6";
	tmp.push(criteria_generate(pat, n, "A + B = 6", function(p) { return p.n[0] + p.n[1] == 6; }, tmp));
	tmp.push(criteria_generate(pat, n, "A + B > 6", function(p) { return p.n[0] + p.n[1] > 6; }, tmp));
	tmp.push(criteria_generate(pat, n, "A + B < 6", function(p) { return p.n[0] + p.n[1] < 6; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 0});

	//20
	tmp = [];
	n = "(0/1 2 3)x X";
	tmp.push(criteria_generate(pat, n, "0/1x X", function(p) { var c = [0, 0, 0, 0, 0]; for(var i=0; i<3; i++) c[p.n[i]-1]++; return Math.max.apply(Math, c) <= 1;}, tmp));
	tmp.push(criteria_generate(pat, n, "2x X", function(p) { var c = [0, 0, 0, 0, 0]; for(var i=0; i<3; i++) c[p.n[i]-1]++; return Math.max.apply(Math, c) == 2;}, tmp));
	tmp.push(criteria_generate(pat, n, "3x X", function(p) { var c = [0, 0, 0, 0, 0]; for(var i=0; i<3; i++) c[p.n[i]-1]++; return Math.max.apply(Math, c) == 3;}, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//21
	tmp = [];
	n = "X X Y Yes | No";
	tmp.push(criteria_generate(pat, n, "X X Y Yes", function(p) { var c = [0, 0, 0, 0, 0]; for(var i=0; i<3; i++) c[p.n[i]-1]++; return Math.max.apply(Math, c) == 2;}, tmp));
	tmp.push(criteria_generate(pat, n, "X X Y No", function(p) { var c = [0, 0, 0, 0, 0]; for(var i=0; i<3; i++) c[p.n[i]-1]++; return Math.max.apply(Math, c) != 2;}, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});


	//22
	tmp = [];
	n = "(A < B < C) | (A > B > C) | (A ? B ? C)";
	tmp.push(criteria_generate(pat, n, "A < B < C", function(p) { return (p.n[0] < p.n[1]) && (p.n[1] < p.n[2]);}, tmp));
	tmp.push(criteria_generate(pat, n, "A > B > C", function(p) { return (p.n[0] > p.n[1]) && (p.n[1] > p.n[2]);}, tmp));
	tmp.push(criteria_generate(pat, n, "A ? B ? C", function(p) { return !(((p.n[0] < p.n[1]) && (p.n[1] < p.n[2])) || ((p.n[0] > p.n[1]) && (p.n[1] > p.n[2])));}, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//23
	tmp = [];
	n = "(A + B + C) < | = | > 6";
	tmp.push(criteria_generate(pat, n, "A + B + C = 6", function(p) { return p.n[0] + p.n[1]+ p.n[2] == 6; }, tmp));
	tmp.push(criteria_generate(pat, n, "A + B + C > 6", function(p) { return p.n[0] + p.n[1]+ p.n[2] > 6; }, tmp));
	tmp.push(criteria_generate(pat, n, "A + B + C < 6", function(p) { return p.n[0] + p.n[1]+ p.n[2] < 6; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//24
	tmp = [];
	n = "(0 2 3) Increment";
	tmp.push(criteria_generate(pat, n, "0 Increment", function(p) { return (p.n[1]-p.n[0] != 1) && (p.n[2]-p.n[1] != 1); }, tmp));
	tmp.push(criteria_generate(pat, n, "2 Increment", function(p) { return (!(p.n[1]-p.n[0] != 1)) != (!(p.n[2]-p.n[1] != 1)); }, tmp));
	tmp.push(criteria_generate(pat, n, "3 Increment", function(p) { return (p.n[1]-p.n[0] == 1) && (p.n[2]-p.n[1] == 1); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//25
	tmp = [];
	n = "(0 2 3) Increment/Decrement";
	tmp.push(criteria_generate(pat, n, "0 Increment/Decrement", function(p) { return ((p.n[1]-p.n[0] != 1) && (p.n[2]-p.n[1] != 1)) && ((p.n[1]-p.n[0] != -1) && (p.n[2]-p.n[1] != -1)); }, tmp));
	tmp.push(criteria_generate(pat, n, "2 Increment/Decrement", function(p) { return ((!(p.n[1]-p.n[0] != 1)) != (!(p.n[2]-p.n[1] != 1))) || ((!(p.n[1]-p.n[0] != -1)) != (!(p.n[2]-p.n[1] != -1))); }, tmp));
	tmp.push(criteria_generate(pat, n, "3 Increment/Decrement", function(p) { return ((p.n[1]-p.n[0] == 1) && (p.n[2]-p.n[1] == 1)) || ((p.n[1]-p.n[0] == -1) && (p.n[2]-p.n[1] == -1)); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//26
	tmp = [];
	n = "(A | B | C) < 3";
	tmp.push(criteria_generate(pat, n, "A < 3", function(p) { return p.n[0] < 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < 3", function(p) { return p.n[1] < 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "C < 3", function(p) { return p.n[2] < 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//27
	tmp = [];
	n = "(A | B | C) < 4";
	tmp.push(criteria_generate(pat, n, "A < 4", function(p) { return p.n[0] < 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < 4", function(p) { return p.n[1] < 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "C < 4", function(p) { return p.n[2] < 4; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//28
	tmp = [];
	n = "(A | B | C) = 1";
	tmp.push(criteria_generate(pat, n, "A = 1", function(p) { return p.n[0] == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = 1", function(p) { return p.n[1] == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "C = 1", function(p) { return p.n[2] == 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//29
	tmp = [];
	n = "(A | B | C) = 3";
	tmp.push(criteria_generate(pat, n, "A = 3", function(p) { return p.n[0] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = 3", function(p) { return p.n[1] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "C = 3", function(p) { return p.n[2] == 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//30
	tmp = [];
	n = "(A | B | C) = 4";
	tmp.push(criteria_generate(pat, n, "A = 4", function(p) { return p.n[0] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = 4", function(p) { return p.n[1] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "C = 4", function(p) { return p.n[2] == 4; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//31
	tmp = [];
	n = "(A | B | C) > 1";
	tmp.push(criteria_generate(pat, n, "A > 1", function(p) { return p.n[0] > 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > 1", function(p) { return p.n[1] > 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "C > 1", function(p) { return p.n[2] > 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 1});

	//32
	tmp = [];
	n = "(A | B | C) > 3";
	tmp.push(criteria_generate(pat, n, "A > 3", function(p) { return p.n[0] > 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > 3", function(p) { return p.n[1] > 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "C > 3", function(p) { return p.n[2] > 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//33
	tmp = [];
	n = "(A | B | C)  Even | Odd";
	tmp.push(criteria_generate(pat, n, "A Even", function(p) { return p.n[0] % 2 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "A Odd", function(p) { return p.n[0] % 2 == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "B Even", function(p) { return p.n[1] % 2 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "B Odd", function(p) { return p.n[1] % 2 == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "C Even", function(p) { return p.n[2] % 2 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "C Odd", function(p) { return p.n[2] % 2 == 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});


	//34
	tmp = [];
	n = "(A <= BC) | (B <= AC) | (C <= AB)";
	tmp.push(criteria_generate(pat, n, "A < BC", function(p) { return (p.n[0] <= p.n[1]) && (p.n[0] <= p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "B < AC", function(p) { return (p.n[1] <= p.n[0]) && (p.n[1] <= p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "C < AB", function(p) { return (p.n[2] <= p.n[0]) && (p.n[2] <= p.n[1]); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//35
	tmp = [];
	n = "(A >= BC) | (B >= AC) | (C >= AB)";
	tmp.push(criteria_generate(pat, n, "A >= BC", function(p) { return (p.n[0] >= p.n[1]) && (p.n[0] >= p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "B >= AC", function(p) { return (p.n[1] >= p.n[0]) && (p.n[1] >= p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "C >= AB", function(p) { return (p.n[2] >= p.n[0]) && (p.n[2] >= p.n[1]); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//36
	tmp = [];
	n = "(A + B + C) = 3x | 4x | 5x";
	tmp.push(criteria_generate(pat, n, "A + B + C = 3x", function(p) { return (p.n[0] + p.n[1]+ p.n[2]) % 3 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "A + B + C = 4x", function(p) { return (p.n[0] + p.n[1]+ p.n[2]) % 4 == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "A + B + C = 5x", function(p) { return (p.n[0] + p.n[1]+ p.n[2]) % 5 == 0; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//37
	tmp = [];
	n = "(A + B) | (B + C) | (A + C) = 4";
	tmp.push(criteria_generate(pat, n, "A + B = 4", function(p) { return (p.n[0] + p.n[1] == 4); }, tmp));
	tmp.push(criteria_generate(pat, n, "B + C = 4", function(p) { return (p.n[1] + p.n[2] == 4); }, tmp));
	tmp.push(criteria_generate(pat, n, "A + C = 4", function(p) { return (p.n[0] + p.n[2] == 4); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//38
	tmp = [];
	n = "(A + B) | (B + C) | (A + C) = 6";
	tmp.push(criteria_generate(pat, n, "A + B = 6", function(p) { return (p.n[0] + p.n[1] == 6); }, tmp));
	tmp.push(criteria_generate(pat, n, "B + C = 6", function(p) { return (p.n[1] + p.n[2] == 6); }, tmp));
	tmp.push(criteria_generate(pat, n, "A + C = 6", function(p) { return (p.n[0] + p.n[2] == 6); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//39
	tmp = [];
	n = "(A | B | C) = | > 1";
	tmp.push(criteria_generate(pat, n, "A = 1", function(p) { return p.n[0] == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > 1", function(p) { return p.n[0] > 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = 1", function(p) { return p.n[1] == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > 1", function(p) { return p.n[1] > 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "C = 1", function(p) { return p.n[2] == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "C > 1", function(p) { return p.n[2] > 1; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//40
	tmp = [];
	n = "(A | B | C) < | = | > 3";
	tmp.push(criteria_generate(pat, n, "A < 3", function(p) { return p.n[0] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "A = 3", function(p) { return p.n[0] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > 3", function(p) { return p.n[0] > 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < 3", function(p) { return p.n[1] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = 3", function(p) { return p.n[1] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > 3", function(p) { return p.n[1] > 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "C < 3", function(p) { return p.n[2] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "C = 3", function(p) { return p.n[2] == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "C > 3", function(p) { return p.n[2] > 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//41
	tmp = [];
	n = "(A | B | C) < | = | > 4";
	tmp.push(criteria_generate(pat, n, "A < 4", function(p) { return p.n[0] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "A = 4", function(p) { return p.n[0] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > 4", function(p) { return p.n[0] > 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < 4", function(p) { return p.n[1] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = 4", function(p) { return p.n[1] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > 4", function(p) { return p.n[1] > 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "C < 4", function(p) { return p.n[2] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "C = 4", function(p) { return p.n[2] == 4; }, tmp));
	tmp.push(criteria_generate(pat, n, "C > 4", function(p) { return p.n[2] > 4; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//42
	tmp = [];
	n = "(A < | > BC) | (B < | > AC) | (C < | > AB)";
	tmp.push(criteria_generate(pat, n, "A < BC", function(p) { return (p.n[0] < p.n[1]) && (p.n[0] < p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "B < AC", function(p) { return (p.n[1] < p.n[0]) && (p.n[1] < p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "C < AB", function(p) { return (p.n[2] < p.n[0]) && (p.n[2] < p.n[1]); }, tmp));
	tmp.push(criteria_generate(pat, n, "A > BC", function(p) { return (p.n[0] > p.n[1]) && (p.n[0] > p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "B > AC", function(p) { return (p.n[1] > p.n[0]) && (p.n[1] > p.n[2]); }, tmp));
	tmp.push(criteria_generate(pat, n, "C > AB", function(p) { return (p.n[2] > p.n[0]) && (p.n[2] > p.n[1]); }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//43
	tmp = [];
	n = "A < | = | > (B | C)";
	tmp.push(criteria_generate(pat, n, "A < B", function(p) { return p.n[0] < p.n[1]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A = B", function(p) { return p.n[0] == p.n[1]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > B", function(p) { return p.n[0] > p.n[1]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A < C", function(p) { return p.n[0] < p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A = C", function(p) { return p.n[0] == p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > C", function(p) { return p.n[0] > p.n[2]; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//44
	tmp = [];
	n = "B < | = | > (A | C)";
	tmp.push(criteria_generate(pat, n, "B < A", function(p) { return p.n[1] < p.n[0]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = A", function(p) { return p.n[1] == p.n[0]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > A", function(p) { return p.n[1] > p.n[0]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < C", function(p) { return p.n[1] < p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = C", function(p) { return p.n[1] == p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > C", function(p) { return p.n[1] > p.n[2]; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//45
	tmp = [];
	n = "(0 1 2 3)x 1 | 3";
	tmp.push(criteria_generate(pat, n, "0x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "0x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//46
	tmp = [];
	n = "(0 1 2 3)x 3 | 4";
	tmp.push(criteria_generate(pat, n, "0x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 3", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 3) c=c+1; return c == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "0x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//47
	tmp = [];
	n = "(0 1 2 3)x 1 | 4";
	tmp.push(criteria_generate(pat, n, "0x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 1", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 1) c=c+1; return c == 3; }, tmp));
	tmp.push(criteria_generate(pat, n, "0x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 0; }, tmp));
	tmp.push(criteria_generate(pat, n, "1x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 1; }, tmp));
	tmp.push(criteria_generate(pat, n, "2x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 2; }, tmp));
	tmp.push(criteria_generate(pat, n, "3x 4", function(p) { var c = 0; for(var i=0;i<p.n.length;i++) if (p.n[i] == 4) c=c+1; return c == 3; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	//48
	tmp = [];
	n = "(A | B | C) < | = | > (A | B | C)";
	tmp.push(criteria_generate(pat, n, "A < B", function(p) { return p.n[0] < p.n[1]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A = B", function(p) { return p.n[0] == p.n[1]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > B", function(p) { return p.n[0] > p.n[1]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B < C", function(p) { return p.n[1] < p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B = C", function(p) { return p.n[1] == p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "B > C", function(p) { return p.n[1] > p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A < C", function(p) { return p.n[0] < p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A = C", function(p) { return p.n[0] == p.n[2]; }, tmp));
	tmp.push(criteria_generate(pat, n, "A > C", function(p) { return p.n[0] > p.n[2]; }, tmp));
	cr.push({name: n, cards: tmp, difficulty: 2});

	return cr;

}


function solutions(criterias) {

	var o = card_none.card;

	for(var i=0; i<criterias.length; i++) {
		o = cards_compute(o, criterias[i].card);
	}


	var sol = [];

	for(var i=0; i < pattern.pattern.length; i++)
	{
		if (o[i]) {
			sol.push(pattern.pattern[i]);
		}
	}

	return sol;
}

function new_game() {

	var difficulty = parseInt($("#difficulty").get(0).value);
	var verifiers = parseInt($("#verifiers").get(0).value);


	level = generate_level(verifiers, difficulty);

	var sol = solutions(level);

	console.log(sol.length + " Solution(s)");
	for(var i=0; i<sol.length; i++) {
		console.log(sol[i].n[0] + "" + sol[i].n[1] + "" + sol[i].n[2] + "");
	}

	generate_dom(pattern);

	update(false);
}

function show_solution(argument) {

	var s = solutions(level);

	for(var i = 0; i < pattern.slots; i++) {
		$("#card"+i).get(0).value = s[0].n[i];
	}

	update(true);

}

$(document).ready(function() {


	pattern = pattern_load("35415515142114134332122414324522333512434243232141221424144145322413251212153542321431444215131254245545443551452213241235435242125244412532252422353411553222113521544155451524525453223342143334531124135133552151231344323112355331111312351313535455554513425432224335311445233442343115421433211325454523511423225514541315352543441341255314533234121214154132345534123253152354555");

	update_all();

	$("#newgame").click(function() {
		new_game();
	});

	$("#solution").click(function() {
		show_solution();
	});


});

