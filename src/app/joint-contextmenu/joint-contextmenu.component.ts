import { Component, OnInit } from '@angular/core';
import * as joint from 'jointjs';

@Component({
  selector: 'app-joint-contextmenu',
  templateUrl: './joint-contextmenu.component.html',
  styleUrls: ['./joint-contextmenu.component.scss']
})
export class JointContextmenuComponent implements OnInit {
  constructor() { }
  ngOnInit() {
    // ref: https://resources.jointjs.com/tutorial/hello-world
    // remember to add JointJS CSS in `angular.json#L33,99` (for `drawGrid` and others)
    const graph = new joint.dia.Graph();
    const paper = new joint.dia.Paper({
      el: document.getElementById('jointjs-holder'),
      model: graph,
      width: window.innerWidth,
      height: window.innerHeight,
      gridSize: 10,
      drawGrid: true
    });

    const rectHello = new joint.shapes.standard.Rectangle({
      position: {x: 100, y: 30},
      size: {width: 100, height: 40},
      attrs: {body: {fill: 'blue'}, label: {text: 'Hello', fill: 'white'}}
    });
    rectHello.addTo(graph);

    // remember to cast type; otherwise, IDE cannot find translate for `joint.dia.Cell`
    const rectWorld = rectHello.clone() as joint.shapes.standard.Rectangle;    // or `joint.dia.Element`
    rectWorld.translate(300, 0);
    rectWorld.attr('label/text', 'World!');
    rectWorld.addTo(graph);

    const link = new joint.shapes.standard.Link({source: rectHello, target: rectWorld});
    link.addTo(graph);

    paper.scale(1.5, 1.5);
    paper.translate(200, 200);
  }
}
